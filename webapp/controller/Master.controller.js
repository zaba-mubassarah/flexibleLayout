sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/f/library",
    "sap/ui/core/Fragment",
    "sap/m/SearchField",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/library",

    "sap/m/Text",
    "sap/m/TextArea",
  ],
  function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    MessageBox,
    fioriLibrary,
    Fragment,
    SearchField,
    JSONModel,
    MessageToast,
    Dialog,
    Button,
    Label,
    mobileLibrary,

    Text,
    TextArea
  ) {
    "use strict";

    return Controller.extend("task.shanita.controller.Master", {
      onInit: async function () {
        var dataFromLocalStorage = JSON.parse(
          localStorage.getItem("ordersInLocal")
        );

        this.oView = this.getView();
        var oOrderModel = new JSONModel(dataFromLocalStorage);

        await this.getView().setModel(oOrderModel, "oOrderModel");

        this.oOwnerComponent = this.getOwnerComponent();
        this.oRouter = this.oOwnerComponent.getRouter();
        this.oRouter.attachRouteMatched(this.onRouteMatched, this);
      },
      onRouteMatched: function (oEvent) {
        console.log("came in");
        var dataFromLocalStorage = JSON.parse(
          localStorage.getItem("ordersInLocal")
        );
        console.log("dataFromLocalStorage", dataFromLocalStorage);
        var oOrderModel = new JSONModel(dataFromLocalStorage);

        this.getView().setModel(oOrderModel, "oOrderModel");
        this.getView().getModel().refresh();
      },

      onApproveDialogPress: function (id) {
        console.log("deleted dialog");
        localStorage.setItem("deletedId", id);
        var DialogType = mobileLibrary.DialogType;
        var ButtonType = mobileLibrary.ButtonType;
        if (!this.oApproveDialog) {
          this.oApproveDialog = new Dialog({
            type: DialogType.Message,
            title: "Confirm",
            content: new Text({ text: "Do you want to Delete this order?" }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "Delete",
              press: function () {
                this.onDeleteButtonPressed();
                MessageToast.show("The order is deleted");
                this.oApproveDialog.close();
              }.bind(this),
            }),
            endButton: new Button({
              text: "Cancel",
              press: function () {
                this.oApproveDialog.close();
              }.bind(this),
            }),
          });
        }

        this.oApproveDialog.open();
      },

      onDeleteButtonPressed: function () {
        let dataFromLocalStorage = JSON.parse(
          localStorage.getItem("ordersInLocal")
        );
        console.log(dataFromLocalStorage);
        var orderData = this.getView()
          .getModel("oOrderModel")
          .getData().orderList;

        let filterdData = dataFromLocalStorage.orderList.filter((item) => {
          return item.oderid != localStorage.getItem("deletedId");
        });
        console.log("filterdData", filterdData);
        localStorage.setItem(
          "ordersInLocal",
          JSON.stringify({ orderList: filterdData })
        );
        let oData = new JSONModel({
          orderList: filterdData,
        });
        this.getView().setModel(oData, "oOrderModel");
        this.getView().getModel().refresh();
      },
      onStatusChange: function (id, stat) {
        console.log("status  dialog", stat);
        if (!stat) {
          localStorage.setItem("statusChangeId", id);
          var DialogType = mobileLibrary.DialogType;
          var ButtonType = mobileLibrary.ButtonType;
          if (!this.oStatusDialog) {
            this.oStatusDialog = new Dialog({
              type: DialogType.Message,
              title: "Confirm",
              content: new Text({ text: "Do you want to change the status?" }),
              beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "Yes",
                press: function () {
                  this.onStatusChangeConfirm();
                  MessageToast.show("The status is changed");
                  this.oStatusDialog.close();
                }.bind(this),
              }),
              endButton: new Button({
                text: "Cancel",
                press: function () {
                  this.oStatusDialog.close();
                }.bind(this),
              }),
            });
          }

          this.oStatusDialog.open();
        }
      },
      onStatusChangeConfirm: function () {
        var statChageId = localStorage.getItem("statusChangeId");
        let localStoragedata = JSON.parse(
          localStorage.getItem("ordersInLocal")
        ).orderList;

        const found = localStoragedata.find(
          (element) => element.oderid == statChageId
        );
        console.log("found", found);

        found.status = true;
        found.delBtnVisible = false;
        var editedArr = {
          orderList: localStoragedata,
        };
        localStorage.setItem("ordersInLocal", JSON.stringify(editedArr));
        let oData = new JSONModel({
          orderList: localStoragedata,
        });
        this.getView().setModel(oData, "oOrderModel");
        this.getView().getModel().refresh();
      },
      onSearch: function (oEvent) {
        var oTableSearchState = [],
          sQuery = oEvent.getParameter("query");

        if (sQuery && sQuery.length > 0) {
          oTableSearchState = [
            new Filter("Name", FilterOperator.Contains, sQuery),
          ];
        }

        this.oProductsTable
          .getBinding("items")
          .filter(oTableSearchState, "Application");
      },
      onValueHelpRequested: function () {
        this._oBasicSearchField = new SearchField();
        if (!this.pDialog) {
          this.pDialog = this.loadFragment({
            name: "task.shanita.view.HelloDialog",
          });
        }
        this.pDialog.then(
          function (oDialog) {
            var oFilterBar = oDialog.getFilterBar();
            this._oVHD = oDialog;
            // Initialise the dialog with model only the first time. Then only open it
            if (this._bDialogInitialized) {
              // Re-set the tokens from the input and update the table
              oDialog.setTokens([]);
              oDialog.setTokens(this._oMultiInput.getTokens());
              oDialog.update();

              oDialog.open();
              return;
            }
            this.getView().addDependent(oDialog);

            // Set key fields for filtering in the Define Conditions Tab
            oDialog.setRangeKeyFields([
              {
                label: "Product",
                key: "ProductCode",
                type: "string",
                typeInstance: new TypeString(
                  {},
                  {
                    maxLength: 7,
                  }
                ),
              },
            ]);

            // Set Basic Search for FilterBar
            oFilterBar.setFilterBarExpanded(false);
            oFilterBar.setBasicSearch(this._oBasicSearchField);

            // Trigger filter bar search when the basic search is fired
            this._oBasicSearchField.attachSearch(function () {
              oFilterBar.search();
            });

            oDialog.getTableAsync().then(
              function (oTable) {
                oTable.setModel(this.oProductsModel);

                // For Desktop and tabled the default table is sap.ui.table.Table
                if (oTable.bindRows) {
                  // Bind rows to the ODataModel and add columns
                  oTable.bindAggregation("rows", {
                    path: "/ZSALESREPORT",
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new UIColumn({
                      label: "Product Code",
                      template: "ProductCode",
                    })
                  );
                  oTable.addColumn(
                    new UIColumn({
                      label: "Product Name",
                      template: "ProductName",
                    })
                  );
                }

                // For Mobile the default table is sap.m.Table
                if (oTable.bindItems) {
                  // Bind items to the ODataModel and add columns
                  oTable.bindAggregation("items", {
                    path: "/ZSALESREPORT",
                    template: new ColumnListItem({
                      cells: [
                        new Label({ text: "{ProductCode}" }),
                        new Label({ text: "{ProductName}" }),
                      ],
                    }),
                    events: {
                      dataReceived: function () {
                        oDialog.update();
                      },
                    },
                  });
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "Product Code" }) })
                  );
                  oTable.addColumn(
                    new MColumn({ header: new Label({ text: "Product Name" }) })
                  );
                }
                oDialog.update();
              }.bind(this)
            );

            oDialog.setTokens(this._oMultiInput.getTokens());

            // set flag that the dialog is initialized
            this._bDialogInitialized = true;
            oDialog.open();
          }.bind(this)
        );
      },

      onItemSelected(oEvent) {
        if (oEvent.getParameter("rowContext")) {
          let oData = oEvent.getParameter("rowContext").getObject();
          console.log("sadasd", oData);
          if (oData.status === true) {
            MessageToast.show("Order already delivered");
          } else {
            this.oRouter.navTo("orderForm", {
              layout: fioriLibrary.LayoutType.TwoColumnsBeginExpanded,
              orderId: oData.oderid,
            });
          }
        }
      },

      onListItemPress: function (oEvent) {
        // var productPath = oEvent
        //     .getSource()
        //     .getBindingContext("oOrderModel")
        //     .getPath(),
        //   product = productPath.split("/").slice(-1).pop();

        this.oRouter.navTo("orderForm", {
          layout: fioriLibrary.LayoutType.TwoColumnsBeginExpanded,
          orderId: "add",
        });
      },
    });
  }
);
