sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"],
  function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("task.shanita.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        var oOrdersModel;

        UIComponent.prototype.init.apply(this, arguments);

        // set products demo model on this sample
        oOrdersModel = new JSONModel(
          sap.ui.require.toUrl("task/shanita/orders.json")
        );
        oOrdersModel.setSizeLimit(1000);
        this.setModel(oOrdersModel, "orders");
      },
    });
  }
);
