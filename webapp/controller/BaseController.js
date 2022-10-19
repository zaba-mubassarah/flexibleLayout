sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/base/Log"],
  function (Controller, History, Log) {
    "use strict";

    return Controller.extend("task.shanita.controller.BaseController", {
      onNavBack: function () {
        console.log("DDDD");
      },
    });
  }
);
