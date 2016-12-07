sap.ui.define([
  'jquery.sap.global',
  'sap/ui/base/Object',
  'sap/ui/model/json/JSONModel',
  'sap/m/InputListItem',
  'sap/ui/core/Fragment'
], function ($, UI5Object, JSONModel, InputListItem, Fragment) {
  "use strict";

  var PopoverHelper = UI5Object.extend("com.mitchbarry.controls.lib.PopoverHelper", {
    _oCore: sap.ui.getCore(),
    _oContext: null,
    _oModelInspector: null,
    _oPopoverModel: null, // JSONModel to support UI display of data
    _sPopoverModelName: '__ModelInspector',
    _sFragmentId: 'com.mitchbarry.controls.ModelInspector',
    _bIsShown: false,
    _aCurrentPropertyPath: [''], 
    _sCurrentModelName: '',

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

    getCurrentDepth: function () {
      return this._aCurrentPropertyPath.length;
    },

    getCurrentPropertyPath: function () {
      var sPath = '';
      var sModelName = this.getCurrentModelName();
      var sModelPathSeparator = '>';
      var bIsDefaultModel = (sModelName === 'undefined');

      if (bIsDefaultModel) {
        sModelPathSeparator = '';
        sModelName = '';
      }

      sPath += sModelName
      sPath += sModelPathSeparator;
      sPath += this._aCurrentPropertyPath.join('/');
      return sPath;
    },

    goUpperLevel: function (iDepth) {
      if (this._aCurrentPropertyPath.length > 1) {
        this._aCurrentPropertyPath.pop();
      } else {
        $.sap.log.warning('com.mitchbarry.controls.ModelInspector: Already at highest level of property tree');
      }
      return this;
    },

    goLowerLevel: function (sPath) {
      this._aCurrentPropertyPath.push(sPath);
    },

    getCurrentModelName: function () {
      return this._sCurrentModelName;
    },

    setCurrentModelName: function (sModelName) {
      this._sCurrentModelName = sModelName;
    },

    getFragmentId: function () {
      return this._sFragmentId;
    },

    getPropertyListId: function () {
      return 'com.mitchbarry.controls.ModelInspector.PropertyList';
    },

    getNavigationContainer: function () {
      var oNavCon = Fragment.byId(this.getFragmentId(), 'navCon');
      return oNavCon;
    },

    _navigateTo: function (sPageId) {
      var oNavCon = this.getNavigationContainer();
      var oNextPage = Fragment.byId(this.getFragmentId(), sPageId);
      
      if (!oNextPage) {
        $.sap.log.error('com.mitchbarry.controls.ModelInspector: Cannot navigate to page in popover - ' + sPageId);
      } else {
        oNavCon.to(oNextPage);
      }
      
      return this;
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
        oPopover = sap.ui.xmlfragment(
          this.getFragmentId(), 
          'com.mitchbarry.controls.lib.ModelInspectorPopover', 
          this);
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
    },

    /**
     * When user clicks back button
     * @event
     */
    onNavBack: function (oEvent) {
      var iDepth = this.getCurrentDepth();
      if (iDepth === 1) {
        this._navigateTo('models');
      } else {
        this.goUpperLevel();
        this._loadPropertiesAtDepth();
      }
      return;
    },

    /**
     * When user clicks on a model to inspect,
     * set property depth at 1, set the current model name, 
     * and navigate to the properties view.
     * 
     * @event
     */
    onInspect: function (oEvent) {
      var sModelName = oEvent.getSource().data().ModelName;
      this.setCurrentModelName(sModelName);
      this._loadPropertiesAtDepth();
      this._navigateTo('properties');
      return;
    },

    /**
     * Load Properties (at Depth)
     * 
     * This method will:
     *   - Get sap.m.List from Popover holding property list items
     *   - Load selected model
     *   - Call external method (this._getControlArray) to build the sap.m.InputListItem array
     *   - Destroy current InputListItems in current view
     *   - Iterate though sap.m.InputListItem objects and add them to the sap.m.List
     * 
     * @function 
     */
    _loadPropertiesAtDepth: function () {
      var oPropertyList = Fragment.byId(this.getFragmentId(), this.getPropertyListId());
      var sModelName = this.getCurrentModelName();
      var oModelHelper = this.getModelHelper();
      var oModel = oModelHelper.getModel(sModelName);
      var oModelData = oModel.getProperty('/');
      var aProperties = this._getControlArray(oModelData);
      oPropertyList.destroyItems();
      for (var i = 0; i < aProperties.length; i++) {
        oPropertyList.addItem(aProperties[i]);
      }
    },

    /**
     * Get Properties (at Depth)
     * 
     * This method will:
     *   - Get sap.m.List from Popover holding property list items
     *   - Load selected model
     *   - Call external method (this._getPropertiesAtDepth) to build the sap.m.InputListItem array
     *   - Destroy current InputListItems in current view
     *   - Iterate though sap.m.InputListItem objects and add them to the sap.m.List
     * 
     * @param {object} oModelData - data from current model object (at property depth)
     * @function 
     */
    _getControlArray: function (oModelData) {
      var aCurrentDepthProperties = [];
      for (var sPropertyName in oModelData) {
        if (oModelData.hasOwnProperty(sPropertyName)) {
          var oProperty = oModelData[sPropertyName];
          var oListItem = this._createListItemFromProperty(sPropertyName, oProperty);
          aCurrentDepthProperties.push(oListItem);
        }
      }
      return aCurrentDepthProperties;
    },

    _createListItemFromProperty: function (sPropertyName, oProperty) {
      var sModelName = this.getCurrentModelName();
      var sPropertyPath = this.getCurrentPropertyPath();
      var oControl = null;
      var sListItemType = null;
      var sPropertyBindingPath = '{' + sPropertyPath + '/' + sPropertyName + '}';

      switch (typeof oProperty) {
        case "function":
          // do nothing ... 
          break;
        case "object":
          // allow drill-down to next level
          break;
        case "number":
          //sListItemType = 'Active';
          oControl = new sap.m.Input({
            value: sPropertyBindingPath,
            type: 'Number'
          });
          break;
        case "string":
          //sListItemType = 'Active';
          oControl = new sap.m.Input({
            value: sPropertyBindingPath
          });
          break;
        case "boolean":
          oControl = new sap.m.Switch({
            state: sPropertyBindingPath
          });
          break;
        default:
          var sPropertyType = typeof oProperty;
          debugger;
          // do nothing ... not handled
          break;
      }

      var oListItem = new InputListItem({
        label: sPropertyName,
        content: (oControl) ? [oControl] : []
      });

      return oListItem;
    }




  });

  return PopoverHelper;
});