sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/ui/model/resource/ResourceModel",
  ],
  function (UIComponent, JSONModel, fioriLibrary, ResourceModel) {
    "use strict";

    return UIComponent.extend("task.shanita.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        console.log("component loaded?");
        var oResourceModel = new ResourceModel({
          bundleName: "task.shanita.i18n.i18n",
          supportedLocales: ["", "de"],
          fallbackLocale: "",
        });
        this.setModel(oResourceModel, "i18n");

        var oModel, oProductsModel, oRouter;

        UIComponent.prototype.init.apply(this, arguments);

        oModel = new JSONModel();
        this.setModel(oModel);

        // set products demo model on this sample

        oRouter = this.getRouter();
        oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
        oRouter.initialize();
      },
      _onBeforeRouteMatched: function (oEvent) {
        var oModel = this.getModel(),
          sLayout = oEvent.getParameters().arguments.layout;

        // If there is no layout parameter, set a default layout (normally OneColumn)
        if (!sLayout) {
          sLayout = fioriLibrary.LayoutType.OneColumn;
        }

        oModel.setProperty("/layout", sLayout);
      },
    });
  }
);
