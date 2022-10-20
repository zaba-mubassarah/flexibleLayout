sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/f/library",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Popup",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    fioriLibrary,
    JSONModel,
    Fragment,
    Filter,
    FilterOperator,
    Popup,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("task.shanita.controller.OrderForm", {
      onInit: async function () {
        this.oView = this.getView();
        var oOrderModel = new JSONModel(
          sap.ui.require.toUrl("task/shanita/orders.json")
        );
        this.getView().setModel(oOrderModel, "oOrderModel");
        var oModel = new JSONModel(
          sap.ui.require.toUrl("task/shanita/customers.json")
        );
        await this.getView().setModel(oModel);
        let countryCityLocal = {
          countryList: [
            {
              countryId: "1",
              countryName: "Bangladesh",
              cityList: [
                {
                  cityId: "1",
                  cityName: "Dhaka",
                },
                {
                  cityId: "2",
                  cityName: "Chattogram",
                },
                {
                  cityId: "3",
                  cityName: "Sylhet",
                },
              ],
            },
            {
              countryId: "2",
              countryName: "India",
              cityList: [
                {
                  cityId: "4",
                  cityName: "Gujrat",
                },
                {
                  cityId: "5",
                  cityName: "Panjab",
                },
                {
                  cityId: "6",
                  cityName: "kalkata",
                },
              ],
            },
            {
              countryId: "3",
              countryName: "Pakistan",
              cityList: [
                {
                  cityId: "7",
                  cityName: "Islamabad",
                },
                {
                  cityId: "8",
                  cityName: "Kashmir",
                },
                {
                  cityId: "9",
                  cityName: "Karachi",
                },
              ],
            },
          ],
        };

        var oCountry = new JSONModel(countryCityLocal);
        localStorage.setItem("cityLists", JSON.stringify(countryCityLocal));
        await this.getView().setModel(oCountry, "oCountry");
        console.log(this.getView().getModel("oCountry"));

        var oOwnerComponent = this.getOwnerComponent();

        this.oRouter = oOwnerComponent.getRouter();
        this.oModel = oOwnerComponent.getModel();

        this.oRouter
          .getRoute("master")
          .attachPatternMatched(this._onProductMatched, this);
        this.oRouter
          .getRoute("orderForm")
          .attachPatternMatched(this._onProductMatched, this);
      },

      _onProductMatched: function (oEvent) {
        let editID = window.location.hash.split("/")[2];
        console.log("editID", editID);
        if (editID == "add") {
          this.addSystemOn();
          this.byId("app_input_orderno").setValue(
            Math.round(Math.random() * 100)
          );
        } else {
          let dataFromLocalStorage = JSON.parse(
            localStorage.getItem("ordersInLocal")
          );
          const result = dataFromLocalStorage.orderList.filter(
            (item) => item.oderid == editID
          );

          if (result.length != 0) {
            this.byId("app_input_orderno").setValue(result[0].oderid);
            this.byId("app_input_customername").setValue(
              result[0].customerName
            );

            let myStr = result[0].address.substr(
              0,
              result[0].address.indexOf(",")
            );
            let city = result[0].address
              .substr(result[0].address.indexOf(","))
              .slice(1);

            let countryData = JSON.parse(
              localStorage.getItem("cityLists")
            ).countryList;
            console.log("countryData", countryData);
            const cityListByCountry = countryData.filter(
              (item) => item.countryName == myStr
            );
            let oCityModel = new JSONModel({
              cityLists: cityListByCountry[0].cityList,
            });

            this.getView().setModel(oCityModel, "oCityModel");
            console.log("cityListByCountry", cityListByCountry);
            this.getView().byId("app_input_country").setSelectedKey(myStr);
            this.getView().byId("app_input_city").setSelectedKey(city);

            this.byId("app_input_date").setValue(result[0].orderDate);
          }
          let oEditModel = new JSONModel({
            editmode: true,
          });
          this.getView().setModel(oEditModel, "editModel");
          let oSaveModel = new JSONModel({
            saveMode: false,
          });
          this.getView().setModel(oSaveModel, "oSaveModel");
        }
      },
      addSystemOn: function () {
        this.byId("app_input_orderno").setValue("ddsd");
        let oEditModel = new JSONModel({
          editmode: false,
        });
        this.getView().setModel(oEditModel, "editModel");
        let oSaveModel = new JSONModel({
          saveMode: true,
        });
        this.getView().setModel(oSaveModel, "oSaveModel");
        this.byId("app_input_orderno").setValue("");
        this.byId("app_input_customername").setValue("");
        this.getView().byId("app_input_country").setSelectedItem(null);
        this.getView().byId("app_input_city").setSelectedItem(null);
        this.byId("app_input_date").setValue("");
        console.log("its an add func");
      },

      onExit: function () {
        this.oRouter
          .getRoute("master")
          .detachPatternMatched(this._onProductMatched, this);
        this.oRouter
          .getRoute("detail")
          .detachPatternMatched(this._onProductMatched, this);
      },
      onCountryChange: function (oEvent) {
        console.log("Ssssss");
        let cityIndex = parseInt(
          oEvent.getParameters().selectedItem.sId.slice(-1)
        );
        let cityData = this.getView().getModel("oCountry").getData()
          .countryList[cityIndex].cityList;

        let oCityModel = new JSONModel({
          cityLists: cityData,
        });

        this.getView().setModel(oCityModel, "oCityModel");
      },

      onCancelPressed: function (oEvent) {
        this.byId("app_input_orderno").setValue("");
        this.byId("app_input_customername").setValue("");
        this.getView().byId("app_input_country").setSelectedItem(null);
        this.getView().byId("app_input_city").setSelectedItem(null);
        this.byId("app_input_date").setValue("");
        this.oRouter.navTo("master", {
          layout: fioriLibrary.LayoutType.OneColumn,
        });
      },
      handleValueHelp: function () {
        var oView = this.getView();

        if (!this._pValueHelpDialogs) {
          this._pValueHelpDialogs = Fragment.load({
            id: oView.getId(),
            name: "task.shanita.view.fragment.ValueHelp",
            controller: this,
          }).then(function (oValueHelpDialog) {
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
          });
        }
        this._pValueHelpDialogs.then(
          function (oValueHelpDialog) {
            oValueHelpDialog.open();
            this._configValueHelpDialog();
          }.bind(this)
        );
      },
      onSavePressed: async function () {
        var orderNo = this.byId("app_input_orderno").getValue();

        var customerName = this.byId("app_input_customername").getValue();

        var countryName = this.getView()
          .byId("app_input_country")
          .getSelectedItem()
          .getText();

        var cityName = this.getView()
          .byId("app_input_city")
          .getSelectedItem()
          .getText();

        var date = this.byId("app_input_date").getValue();
        console.log("date", orderNo, customerName, countryName, cityName, date);
        //console.log("gender", gender);

        let newEntry = {
          oderid: orderNo,
          customerName: customerName,
          address: `${countryName},${cityName}`,
          orderDate: date,
          status: false,
          delBtnVisible: true,
        };
        if (!localStorage.getItem("ordersInLocal")) {
          var orderJsondata = {
            orderList: [newEntry],
          };
          localStorage.setItem("ordersInLocal", JSON.stringify(orderJsondata));
          this.oRouter.navTo("master", {
            layout: fioriLibrary.LayoutType.OneColumn,
          });
        } else {
          const localStoragedata2 = JSON.parse(
            localStorage.getItem("ordersInLocal")
          );

          const result = localStoragedata2.orderList.filter(
            (word) => word.oderid == orderNo
          );
          console.log("result", result.length);
          if (result.length != 0) {
            MessageToast.show("Order id already exist");
          } else {
            localStoragedata2.orderList.push(newEntry);
            localStorage.setItem(
              "ordersInLocal",
              JSON.stringify(localStoragedata2)
            );

            this.byId("app_input_orderno").setValue("");
            this.byId("app_input_customername").setValue("");
            this.getView().byId("app_input_country").setSelectedItem(null);
            this.getView().byId("app_input_city").setSelectedItem(null);
            this.byId("app_input_date").setValue("");
            this.oRouter.navTo("master", {
              layout: fioriLibrary.LayoutType.OneColumn,
            });
          }
        }
      },
      onUpdateCall: function () {
        let localStoragedata = JSON.parse(
          localStorage.getItem("ordersInLocal")
        ).orderList;
        let editID = window.location.hash.split("/")[2];
        const found = localStoragedata.find(
          (element) => element.oderid == editID
        );
        console.log("found", found);
        found.customerName = this.byId("app_input_customername").getValue();

        var countryName = this.getView()
          .byId("app_input_country")
          .getSelectedItem()
          .getText();

        var cityName = this.getView()
          .byId("app_input_city")
          .getSelectedItem()
          .getText();
        found.address = `${countryName},${cityName}`;
        found.orderDate = this.byId("app_input_date").getValue();
        var editedArr = {
          orderList: localStoragedata,
        };
        localStorage.setItem("ordersInLocal", JSON.stringify(editedArr));
        this.oRouter.navTo("master", {
          layout: fioriLibrary.LayoutType.OneColumn,
        });
      },
      onCloseDialog(oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem"),
          oInput = this.byId("app_input_customername");
        if (!oSelectedItem) {
          oInput.resetProperty("value");
          return;
        }

        oInput.setValue(oSelectedItem.getCells()[1].getTitle());
      },
      _configValueHelpDialog: function () {
        var sInputValue = this.byId("app_input_customername").getValue(),
          oModel = this.getView().getModel(),
          customers = oModel.getProperty("/customerList");

        customers.forEach(function (cust) {
          cust.selected = cust.customerName === sInputValue;
        });

        oModel.setProperty("/customerList", customers);
        //console.log("sInputValue", selected);
      },
      handleSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");

        var oFilter = new Filter(
          "customerName",
          FilterOperator.Contains,
          sValue
        );
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter([oFilter]);
      },
    });
  }
);
