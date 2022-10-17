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
    MessageToast
  ) {
    "use strict";

    return Controller.extend("task.shanita.controller.Master", {
      onInit: function () {
        this.oView = this.getView();
        var oOrderModel = new JSONModel(
          sap.ui.require.toUrl("task/shanita/orders.json")
        );
        this.getView().setModel(oOrderModel, "oOrderModel");
      },
      onDeleteButtonPressed: function (id) {
        console.log("DSDSDSD", id);
        var orderData = this.getView()
          .getModel("oOrderModel")
          .getData().orderList;

        let filterdData = orderData.filter((item) => {
          return item.oderid != id;
        });
        let oData = new JSONModel({
          orderList: filterdData,
        });
        this.getView().setModel(oData, "oOrderModel");
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
      onAdd: function () {
        MessageBox.information("This functionality is not ready yet.", {
          title: "Aw, Snap!",
        });
      },

      onSort: function () {
        this._bDescendingSort = !this._bDescendingSort;
        var oBinding = this.oProductsTable.getBinding("items"),
          oSorter = new Sorter("Name", this._bDescendingSort);

        oBinding.sort(oSorter);
      },
      onItemSelected(oEvent) {
        console.log("heeyy");
        let oData = oEvent.getParameter("rowContext").getObject();
        if (oData.status === "yes") {
          MessageToast.show("Order already delivered");
        } else {
          var oFCL = this.oView.getParent().getParent();
          oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsBeginExpanded);
        }
      },
      onOpenDialog: function () {
        // create dialog lazily
        if (!this.pDialog) {
          this.pDialog = this.loadFragment({
            name: "task.shanita.view.HelloDialog",
          });
        }
        this.pDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      onCloseDialog: function () {
        // note: We don't need to chain to the pDialog promise, since this event-handler
        // is only called from within the loaded dialog itself.
        this.byId("helloDialog").close();
      },
      onListItemPress: function () {
        var oFCL = this.oView.getParent().getParent();
        oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsBeginExpanded);
      },
      onCancelClick: function () {
        var oFCL = this.oView.getParent().getParent();
        oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
      },
    });
  }
);
