sap.ui.define([
  'jquery.sap.global',
  'sap/ui/base/Object',
  'sap/ui/model/json/JSONModel'
], function ($, UI5Object, JSONModel) {
  "use strict";

  var PopoverHelper = UI5Object.extend("com.mitchbarry.controls.lib.PopoverHelper", {
    _oCore: sap.ui.getCore(),
    _oContext: null,
    _oModelInspector: null,
    _oPopoverModel: null, // JSONModel to support UI display of data
    _sPopoverModelName: '__ModelInspector',
    _bIsShown: false,

    constructor: function () {
      
    },

    setContext: function (oContext) {
      this._oContext = oContext;
      this.setPopoverModel(new JSONModel({
        Models: [],
        InspectingModel: {}
      }));
      return this;
    },

    getContext: function () {
      return this._oContext;
    },

    /**
     * Get Popover Control
     * 
     * Retrieve the ResponsivePopover control from the 
     * _popover aggregation found from the custom object 
     * ModelInspector.
     * 
     * @returns {sap.m.ResponsivePopover} oResponsivePopover - The ResponsivePopover object from the ModelInspector control.
     */
    getPopoverControl: function () {
      var oModelInspector = this.getModelInspector();
      if (!oModelInspector) {
        $.sap.log.error('com.mitchbarry.controls.ModelInspector: ModelInspector not attached');
        return null;
      }
      
      var oPopover = oModelInspector.getAggregation('_popover');

      if (!oPopover) {
        oPopover = sap.ui.xmlfragment(this.getContext().getId(), 'com.mitchbarry.controls.lib.ModelInspectorPopover');
        oModelInspector.setAggregation("_popover", oPopover);
      }
      
      return oPopover;
    },

    setModelInspector: function (oModelInspector) {
      this._oModelInspector = oModelInspector;
      return this;
    },

    getModelInspector: function () {
      return this._oModelInspector;
    },

    setPopoverModel: function (oModel) {
      this._oPopoverModel = oModel;
      this.getContext().setModel(this._oPopoverModel, this._sPopoverModelName);
      return this;
    },

    getPopoverModel: function () {
      return this.getContext().getModel(this._sPopoverModelName);;
    },

    getModelHelper: function () {
      return this.getModelInspector().getModelHelper();
    },

    setModels: function (aModels) {
      if (aModels.length >= 0) {
        var oModel = this.getPopoverModel();
        oModel.setProperty('/Models', aModels);
      }
      return this;
    },

    openBy: function (oControl) {
      if (!oControl) {
        $.sap.log.error('com.mitchbarry.controls.ModelInspector: Cannot display Popover without a control to relate it to.');
        return null;
      }
      var oPopover = this.getPopoverControl();
      oPopover.openBy(oControl);
      return this;
    }

  });

  return PopoverHelper;
});