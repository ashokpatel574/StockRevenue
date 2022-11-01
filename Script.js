"use strict";
{
  /* button */
  const btnCheck = document.querySelector(".btn-check");
  const btnSubmitCompany = document.querySelector(".btnSubmit-company");
  const btnSubmitDate = document.querySelector(".btnSubmit-date");

  /*  form */
  const formCompanyCode = document.querySelector(".form-companyName");
  const form_companyCode = document.querySelector(".form-companyCode");
  const form_calculation = document.querySelector(".form-calculation");

  const messageBox = document.querySelector(".message");
  const tradingImg = document.querySelector(".trading");

  function resultDisplay() {
    tradingImg.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }

  async function getCompanyCode(e) {
    try {
      e.preventDefault();
      const companyName = document.querySelector(".companyNameInput");
      const selectOptions = document.querySelector("select");
      const companyCodeData_Array = [];
      const companyRegion_Array = [];
      const companyNameInput = companyName.value;
      messageBox.innerText = ``;
      tradingImg.src = `./Assests/Hero.png`;

      // If  company name is not entered then throw alert message
      if (companyNameInput === "") {
        throw new Error("Please enter company name below in input box ");
      }

      const response = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${companyNameInput}&apikey=19XFBSO60KMUN827`
      );

      if (!response.ok) {
        throw new Error(`(${response.status})`);
      }
      const data = await response.json();
      const companyCodeOutput = data.bestMatches;

      if (companyCodeOutput.length > 0) {
        for (let i = 0; i < companyCodeOutput.length; i++) {
          const item = companyCodeOutput[i];
          companyCodeData_Array[i] = item[`1. symbol`];
          companyRegion_Array[i] = item[`4. region`];
        }

        selectOptions.innerHTML = "";
        for (let i = 0; i < companyCodeData_Array.length; i++) {
          const options = `<option value=${companyCodeData_Array[i]}>${companyCodeData_Array[i]}--${companyRegion_Array[i]}</option>`;
          selectOptions.insertAdjacentHTML("beforeend", options);
        }

        const getMAX_date = new Date(Date.now() - 864e5)
          .toISOString()
          .substring(0, 10);
        document.querySelector(".purchaseDate").max = getMAX_date;

        form_companyCode.style.display = "flex";
      } else {
        throw new Error("Please enter valid company name below in input box ");
      }
    } catch (error) {
      messageBox.innerText = `${error.status || ""} ${
        error.message || " "
      }. Try again!`;
      messageBox.style.color = "#ff1a1a";
      tradingImg.src = `./Assests/error.png`;
      resultDisplay();
    }
  }

  async function getInitialPrice(e) {
    e.preventDefault();
    try {
      const companyCode = document.querySelector(".companyCode");
      const purchaseDate = document.querySelector(".purchaseDate");
      const initialPrice = document.querySelector(".initialPrice");
      const currentPrice = document.querySelector(".currentPrice");

      const companyCodeInput = companyCode.value;
      const purchaseDateInput = purchaseDate.value;
      messageBox.innerText = ``;
      tradingImg.src = `./Assests/Hero.png`;

      // If  company name is not entered then throw alert message
      if (companyCodeInput === "") {
        throw new Error("Please select company code from option box ");
      }

      // If  company name is not entered then throw alert message
      if (purchaseDateInput === "") {
        throw new Error(
          "Please select stock purchase date from date option box "
        );
      }

      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${companyCodeInput}&&outputsize=full&outputsize=full&apikey=19XFBSO60KMUN827`
      );

      if (!response.ok) {
        throw new Error(`(${response.status})`);
      }

      const data = await response.json();
      const companyTimeSeries_DailyData = data[`Time Series (Daily)`];

      const timeSeriesData_Object = new Map(
        Object.entries(companyTimeSeries_DailyData)
      );

      const ipoDate = [...timeSeriesData_Object.keys()].pop();

      const user_purchaseDate = timeSeriesData_Object.get(purchaseDateInput);

      function setInvalidDateErrorMessage(dateInput, errorMessage) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        throw new Error(
          `Note. ${errorMessage} (${dateInput.toLocaleDateString(
            "en-US",
            options
          )} )`
        );
      }

      if (!user_purchaseDate) {
        const purchaseDate = new Date(purchaseDateInput);
        const stockIPODate = new Date(ipoDate);
        if (purchaseDate.getTime() > stockIPODate.getTime()) {
          // If selected stock date fallens on non-working day.
          setInvalidDateErrorMessage(
            purchaseDate,
            `The selected date falls on a non-working day.`
          );
        } else {
          // If selected stock date is before stock IPO date.
          setInvalidDateErrorMessage(
            stockIPODate,
            `Company IPO launch date is`
          );
          tradingImg.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      }

      if (user_purchaseDate) {
        const initialPrice_onPurchaseDate = user_purchaseDate[`4. close`];
        initialPrice.placeholder = parseFloat(initialPrice_onPurchaseDate);
        form_calculation.style.display = "flex";

        const previousDate = new Date(Date.now() - 864e5)
          .toISOString()
          .substring(0, 10);
        const currentPrice_data = timeSeriesData_Object.get(previousDate);

        if (currentPrice_data) {
          const currentPrice_byAPI = currentPrice_data[`4. close`];
          currentPrice.placeholder = parseFloat(currentPrice_byAPI);
        }
      }
    } catch (error) {
      messageBox.innerText = `${error.status || ""} ${
        error.message || " "
      }. Try again!`;
      messageBox.style.color = "#ff1a1a";
      tradingImg.src = `./Assests/error.png`;
      resultDisplay();
    }
  }

  function getInvestmentStatus(e) {
    resultDisplay();
    e.preventDefault();
    try {
      const initialPrice = document.querySelector(".initialPrice");
      const quantity = document.querySelector(".quantity");
      const currentPrice = document.querySelector(".currentPrice");

      const initialPrice_byAPI = parseFloat(initialPrice.placeholder);
      const currentPrice_byAPI = parseFloat(currentPrice.placeholder);
      const purchasePriceInput = parseFloat(initialPrice.value);
      const currentPriceInput = parseFloat(currentPrice.value);
      const qtyInput = parseInt(quantity.value);

      messageBox.innerText = ``;
      tradingImg.src = `./Assests/Hero.png`;
      document.documentElement.style.setProperty("--primary-color", "#1a1aff");
      document.documentElement.style.setProperty(
        "--highlight-color",
        "#000ebb"
      );
      document.documentElement.style.setProperty(
        "--bgcolor-lightr",
        "#1a1aff33"
      );

      messageBox.style.color = "#1a1aff";

      let differenceValue;
      let percentAge;
      let price_purchase = purchasePriceInput || initialPrice_byAPI;
      let price_current = currentPriceInput || currentPrice_byAPI;

      // If  company name is not entered then throw alert message
      if (!qtyInput || qtyInput <= 0) {
        throw new Error("Please enter quantity of stock in input field ");
      }

      if (!price_current || price_current <= 0) {
        throw new Error("Please note current price of stock is not valid  ");
      }

      if (!price_purchase || price_purchase <= 0) {
        throw new Error("Please note initial price of stock is not valid  ");
      }

      if (qtyInput) {
        if (price_current > 0 || price_purchase > 0) {
          resultDisplay();
          // Stock Loss Calculation
          if (price_purchase > price_current) {
            differenceValue = Math.abs(price_purchase - price_current);

            percentAge = (differenceValue / price_purchase) * 100;

            messageBox.innerText = `You have incurred ${percentAge.toFixed(
              1
            )}% loss worth Rs.${(differenceValue * qtyInput).toFixed(1)} `;

            document.documentElement.style.setProperty(
              "--primary-color",
              "#ff1a1a"
            );
            document.documentElement.style.setProperty(
              "--highlight-color",
              "#ff0000"
            );
            document.documentElement.style.setProperty(
              "--bgcolor-lightr",
              "#ff1a1a4d"
            );
            messageBox.style.color = "#ff1a1a";

            if (percentAge < 50) {
              tradingImg.src = `./Assests/loss-1.png`;
            }

            if (percentAge > 50) {
              tradingImg.src = `./Assests/loss.png`;
            }
          }

          if (price_purchase < price_current) {
            // Stock Profit calculation
            differenceValue = Math.abs(price_current - price_purchase);
            percentAge = (differenceValue / price_purchase) * 100;

            messageBox.innerText = `You have gained ${percentAge.toFixed(
              1
            )}% profit worth Rs.${(differenceValue * qtyInput).toFixed(1)}`;

            document.documentElement.style.setProperty(
              "--primary-color",
              "#1a8d1a"
            );
            document.documentElement.style.setProperty(
              "--highlight-color",
              "#008000"
            );
            document.documentElement.style.setProperty(
              "--bgcolor-lightr",
              "#1a8e1a4d"
            );
            messageBox.style.color = "#1a8d1a";

            if (percentAge < 50) {
              tradingImg.src = `./Assests/profit.png`;
            }

            if (percentAge > 50) {
              tradingImg.src = `./Assests/profit-1.png`;
              document.documentElement.style.setProperty(
                "--your-variable",
                "#YOURCOLOR"
              );
            }
          }

          if (price_current === price_purchase) {
            messageBox.innerText = "NO CHANGE!";
            tradingImg.src = `./Assests/netural.png`;
          }
        }
      }
    } catch (error) {
      messageBox.innerText = `${error.status || ""} ${
        error.message || " "
      }. Try again!`;
      messageBox.style.color = "#ff1a1a";
      tradingImg.src = `./Assests/error.png`;
      resultDisplay();
    }
  }

  btnSubmitCompany.addEventListener("click", getCompanyCode);
  btnSubmitDate.addEventListener("click", getInitialPrice);
  btnCheck.addEventListener("click", getInvestmentStatus);
}
