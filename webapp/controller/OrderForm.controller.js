sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/f/library",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Popup",
  ],
  function (
    Controller,
    fioriLibrary,
    JSONModel,
    Fragment,
    Filter,
    FilterOperator,
    Popup
  ) {
    "use strict";

    return Controller.extend("task.shanita.controller.OrderForm", {
      onInit: async function () {
        this.oView = this.getView();
        var oModel = new JSONModel(
          sap.ui.require.toUrl("task/shanita/customers.json")
        );

        var oCountry = new JSONModel(
          sap.ui.require.toUrl("task/shanita/country.json")
        );
        await this.getView().setModel(oCountry, "oCountry");
        console.log(this.getView().getModel("oCountry"));
      },
      onCountryChange: function (oEvent) {
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

      onCancelPressed() {
        var oFCL = this.oView.getParent().getParent();
        console.log("oFCL", oFCL);
        oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
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
