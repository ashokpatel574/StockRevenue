"use strict";

/* button */
const btnCheck = document.querySelector(".btn-check");
const btnSubmitCompany = document.querySelector(".btnSubmit-company");
const btnSubmitDate = document.querySelector(".btnSubmit-date");

/*  form */
//const formCompanyCode = document.querySelector(".form-companyName");
const formCompanyRegionElem = document.querySelector(".form-companyCode");
const formCalculationElem = document.querySelector(".form-calculation");

const messageBox = document.querySelector(".message");
const resultTradingImgElem = document.querySelector(".trading");

function resultDisplay() {
  resultTradingImgElem.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
}

function setInvalidDateErrorMessage(dateInput, errorMessage) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  throw new Error(
    `Note. ${errorMessage} (${dateInput.toLocaleDateString("en-US", options)} )`
  );
}

const currencyFormatter = function (currency, value, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

async function getCompanyRegionData(e) {
  try {
    e.preventDefault();

    const companyNameElem = document.querySelector(".companyNameInput");
    const selectOptionsElem = document.querySelector("select.companyCode");

    const companyCodeDataBase = [];
    const companyRegionDataBase = [];
    const companyRegionCurrencyDataBase = [];
    const companyNameInput = companyNameElem.value;
    messageBox.innerText = ``;
    resultTradingImgElem.src = `./Assests/Hero.png`;

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

    console.log(data);

    const companyListDatabase = data?.bestMatches;

    if (companyListDatabase.length > 0) {
      companyListDatabase?.forEach((item, i) => {
        companyCodeDataBase[i] = item[`1. symbol`];
        companyRegionDataBase[i] = item[`4. region`];
        companyRegionCurrencyDataBase[i] = item[`8. currency`];
      });

      selectOptionsElem.innerHTML = "";

      companyRegionDataBase?.forEach((_, i) => {
        const options = `<option data-currencyCode=${companyRegionCurrencyDataBase[i]} value=${companyCodeDataBase[i]}>${companyCodeDataBase[i]}--${companyRegionDataBase[i]}</option>`;
        selectOptionsElem.insertAdjacentHTML("beforeend", options);
      });

      const getMAX_date = new Date(Date.now() - 864e5)
        .toISOString()
        .substring(0, 10);

      document.querySelector(".purchaseDate").max = getMAX_date;

      formCompanyRegionElem.style.display = "flex";
    } else {
      throw new Error("Please enter valid company name below in input box ");
    }
  } catch (error) {
    console.log(error.message);
    messageBox.innerText = `${
      error.status || ""
    } Something went wrong. Try again!`;
    messageBox.style.color = "#ff1a1a";
    resultTradingImgElem.src = `./Assests/error.png`;
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
    resultTradingImgElem.src = `./Assests/Hero.png`;

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
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${companyCodeInput}&outputsize=full&apikey=19XFBSO60KMUN827`
    );

    if (!response.ok) {
      throw new Error(`(${response.status})`);
    }

    const data = await response.json();
    const companyTimeSeries_DailyData = Object.values(data)[1];

    const timeSeriesData_Object = new Map(
      Object.entries(companyTimeSeries_DailyData)
    );

    const ipoDate = [...timeSeriesData_Object.keys()].pop();

    const user_purchaseDate = timeSeriesData_Object.get(purchaseDateInput);

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
        setInvalidDateErrorMessage(stockIPODate, `Company IPO launch date is`);
        resultDisplay();
      }
    }

    if (user_purchaseDate) {
      const initialPrice_onPurchaseDate = Object.values(user_purchaseDate)[3];
      initialPrice.placeholder = parseFloat(initialPrice_onPurchaseDate);
      formCalculationElem.style.display = "flex";

      let previousDate = new Date(Date.now() - 864e5)
        .toISOString()
        .substring(0, 10);

      let currentPrice_data = timeSeriesData_Object.get(previousDate);

      function getCurrentPrice_data(currentPrice_data) {
        if (currentPrice_data) {
          const currentPrice_byAPI = Object.values(currentPrice_data)[3];
          currentPrice.placeholder = parseFloat(currentPrice_byAPI);
        }

        if (typeof currentPrice_data === "undefined") {
          previousDate = new Date(new Date(previousDate).getTime() - 864e5)
            .toISOString()
            .substring(0, 10);

          currentPrice_data = timeSeriesData_Object.get(previousDate);
          getCurrentPrice_data(currentPrice_data);
        }
      }

      getCurrentPrice_data(currentPrice_data);
    }
  } catch (error) {
    messageBox.innerText = `${error.status || ""} ${
      error.message || " "
    }. Try again!`;
    messageBox.style.color = "#ff1a1a";
    resultTradingImgElem.src = `./Assests/error.png`;
    resultDisplay();
  }
}

function getInvestmentStatus(e) {
  e.preventDefault();
  resultDisplay();
  try {
    const initialPrice = document.querySelector(".initialPrice");
    const quantity = document.querySelector(".quantity");
    const currentPrice = document.querySelector(".currentPrice");

    const initialPrice_byAPI = parseFloat(initialPrice.placeholder);
    const currentPrice_byAPI = parseFloat(currentPrice.placeholder);
    const purchasePriceInput = parseFloat(initialPrice.value);
    const currentPriceInput = parseFloat(currentPrice.value);
    const qtyInput = parseInt(quantity.value);
    const companyCode = document.querySelector(".companyCode");
    const companyCurrencyInputCode =
      companyCode.options[companyCode.selectedIndex].getAttribute(
        "data-currencyCode"
      );

    messageBox.innerText = ``;
    resultTradingImgElem.src = `./Assests/Hero.png`;

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
        // Stock Loss Calculation
        if (price_purchase > price_current) {
          differenceValue = Math.abs(price_purchase - price_current);

          percentAge = (differenceValue / price_purchase) * 100;

          messageBox.innerText = `You have incurred ${percentAge.toFixed(
            1
          )}% loss worth ${currencyFormatter(
            companyCurrencyInputCode,
            (differenceValue * qtyInput).toFixed(1)
          )} `;

          messageBox.style.color = "#ff1a1a";

          if (percentAge < 50) {
            resultTradingImgElem.src = `./Assests/loss-1.png`;
          }

          if (percentAge > 50) {
            resultTradingImgElem.src = `./Assests/loss.png`;
          }
        }

        if (price_purchase < price_current) {
          // Stock Profit calculation
          differenceValue = Math.abs(price_current - price_purchase);
          percentAge = (differenceValue / price_purchase) * 100;

          messageBox.innerText = `You have gained ${percentAge.toFixed(
            1
          )}% profit worth ${currencyFormatter(
            companyCurrencyInputCode,
            (differenceValue * qtyInput).toFixed(1)
          )}`;

          messageBox.style.color = "#1a8d1a";

          if (percentAge < 50) {
            resultTradingImgElem.src = `./Assests/profit.png`;
          }

          if (percentAge > 50) {
            resultTradingImgElem.src = `./Assests/profit-1.png`;
            document.documentElement.style.setProperty(
              "--your-variable",
              "#YOURCOLOR"
            );
          }
        }

        if (price_current === price_purchase) {
          messageBox.innerText = "NO CHANGE!";
          resultTradingImgElem.src = `./Assests/netural.png`;
        }
      }
    }
  } catch (error) {
    messageBox.innerText = `${error.status || ""} ${
      error.message || " "
    }. Try again!`;
    messageBox.style.color = "#ff1a1a";
    resultTradingImgElem.src = `./Assests/error.png`;
    resultDisplay();
  }
}

btnSubmitCompany.addEventListener("click", getCompanyRegionData);
btnSubmitDate.addEventListener("click", getInitialPrice);
btnCheck.addEventListener("click", getInvestmentStatus);
