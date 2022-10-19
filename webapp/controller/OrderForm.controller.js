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
        var oCountry = new JSONModel(
          sap.ui.require.toUrl("task/shanita/country.json")
        );
        await this.getView().setModel(oCountry, "oCountry");
        console.log(this.getView().getModel("oCountry"));

        var oOwnerComponent = this.getOwnerComponent();

        this.oRouter = oOwnerComponent.getRouter();
        this.oModel = oOwnerComponent.getModel();

        this.oRouter
          .getRoute("master")
          .attachPatternMatched(this._onProductMatched, this);
        this.oRouter
          .getRoute("detail")
          .attachPatternMatched(this._onProductMatched, this);
      },

      _onProductMatched: function (oEvent) {
        this._product =
          oEvent.getParameter("arguments").product || this._product || "0";
        this.getView().bindElement({
          path: "/ProductCollection/" + this._product,
          model: "products",
        });
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
        // var oFCL = this.oView.getParent().getParent().getParent();
        // console.log("oFCL", oFCL);
        // oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
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
            this.oRouter.navTo("master", {
              layout: fioriLibrary.LayoutType.OneColumn,
            });
            this.byId("app_input_orderno").setValue("");
            this.byId("app_input_customername").setValue("");
            this.getView().byId("app_input_country").setSelectedItem(null);
            this.getView().byId("app_input_city").setSelectedItem(null);
            this.byId("app_input_date").setValue("");
          }
        }
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
