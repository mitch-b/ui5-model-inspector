sap.ui.define([
  'jquery.sap.global',
  'sap/ui/base/Object',
  'sap/ui/model/json/JSONModel',
  'sap/m/InputListItem',
  'sap/ui/core/Fragment',
  'sap/ui/model/BindingMode'
], function ($, UI5Object, JSONModel, InputListItem, Fragment, BindingMode) {
  "use strict";

  /**
   * PopoverHelper
   * 
   * @class
   * PopoverHelper class library handles interaction with the 
   * <code>sap.m.ResponsivePopover</code> object, including events and 
   * building the property list structure. 
   * 
   * This library will contain most of the business logic for the control. 
   * 
   * @public
   * @extends sap.ui.base.Object
   * @alias com.mitchbarry.controls.lib.PopoverHelper
   */
  var PopoverHelper = UI5Object.extend("com.mitchbarry.controls.lib.PopoverHelper",
    /** @lends com.mitchbarry.controls.lib.PopoverHelper.prototype */
    {
      /**
       * Context object
       * @property {object} oContext - Context object where Models can be pulled 
       */
      _oContext: null,
      /**
       * Model Inspector instance
       * @property {com.mitchbarry.controls.ModelInspector} oModelInspector - instance of parent ModelInspector object, for internal use
       */
      _oModelInspector: null,

      /**
       * Popover Model
       * @property {sap.ui.model.json.JSONModel} oPopoverModel - JSONModel used to populate data for the Popover control
       */
      _oPopoverModel: null,

      /**
       * Object Ids
       * 
       * This hashmap contains Ids of objects in the Popover view, used to manipulate control internally.
       * 
       * @property {hashmap} mIds - Ids of objects in ModelInspector control
       */
      _mIds: {
        i18nModelName: 'i18n',
        PopoverModelName: '__ModelInspector',
        PropertyListId: 'com.mitchbarry.controls.ModelInspector.PropertyList',
        FragmentId: 'com.mitchbarry.controls.ModelInspector',
        NavContainerId: 'navCon',
        PropertyPageId: 'properties',
        ModelsPageId: 'models'
      },

      /**
       * Current Property Path
       * @property {string[]} aCurrentPropertyPath - array with model depth, such that model>/level1/property would be ['', 'level1', 'property']
       */
      _aCurrentPropertyPath: [''],

      /**
       * Current Model Name
       * @property {string} sCurrentModelName - contains name of current model, set by [.onInspect]{@link com.mitchbarry.controls.lib.PopoverHelper.onInspect}
       */
      _sCurrentModelName: '',

      /**
       * Default i18n Values
       * 
       * To override strings in this custom control, your i18n file must contain the following keys:
       *   - com.mitchbarry.controls.ModelInspector.Title
       * 
       * Or, default values will be used.
       * @property {hashmap} mDefaultI18nValues - hashmap of default texts used by the ModelInspector popover
       */
      _mDefaultI18nValues: {
        "com.mitchbarry.controls.ModelInspector.Title": "Model Inspector"
      },

      /**
       * constructor
       * 
       * @constructor
       */
      constructor: function () {

      },

      /**
       * Set Context
       * @function
       * 
       * Set current view context object so that internal JSONModel can be assigned to it.
       * When assigned, the JSONModel is registered to it.
       * 
       * @param {object} oContext - Context object
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      setContext: function (oContext) {
        this._oContext = oContext;
        this.setPopoverModel(new JSONModel({
          Models: [],
          InspectingModel: {}
        }));
        return this;
      },

      /**
       * Get Context
       * @function
       * 
       * Get current context object where Models can be pulled
       * @returns {object} oContext - Context object
       */
      getContext: function () {
        return this._oContext;
      },

      /**
       * Get Id
       * @function
       * 
       * Provide access to [_mIds]{@link com.mitchbarry.controls.lib.PopoverHelper._mIds}
       * 
       * @returns {string} sId - Id of object, or empty string if not found 
       */
      _getId: function (sEntry) {
        var sId = this._mIds[sEntry];
        if (!sId) {
          $.sap.log.error('com.mitchbarry.controls.ModelInspector: Unable to find Id for ' + sEntry);
        }
        return sId || '';
      },

      /**
       * Get Current Depth
       * @function
       * 
       * @property {int} iCurrentDepth - return length of [_aCurrentPropertyPath]{@link com.mitchbarry.controls.lib.PopoverHelper._aCurrentPropertyPath}
       */
      getCurrentDepth: function () {
        return this._aCurrentPropertyPath.length;
      },

      /**
       * Get Current Property Path
       * @function
       * 
       * Return a proper path string based on current depth of selected model. The returned path 
       * is intended for use by <code>model.getProperty(sPropertyPath)</code>.
       * 
       * If optional model prefix parameter is passed in, the model name will be included in response. This 
       * is helpful for setting the Popover title, or for setting XML binding information.
       * 
       * If the model name is 'undefined', the model name is stripped from the path, even if the include prefix 
       * parameter is set to true.
       * 
       * The intended response will always be at least '/' if at root of model.
       * 
       * @param {boolean} [bIncludeModelPrefix] - If true, preface property path with "modelName>"
       * @returns {string} sPropertyPath - Path to currently selected property in Popover
       */
      getCurrentPropertyPath: function (bIncludeModelPrefix) {
        var sPath = '';
        var sModelName = this.getCurrentModelName();
        var sModelPathSeparator = '>';
        var bIsDefaultModel = (sModelName === 'undefined');

        if (bIsDefaultModel) {
          sModelPathSeparator = '';
          sModelName = '';
        }

        if (bIncludeModelPrefix) {
          sPath += sModelName
          sPath += sModelPathSeparator;
        }

        sPath += (this._aCurrentPropertyPath.join('/') || '/');
        return sPath;
      },

      /**
       * Go Upper Level
       * @function
       * 
       * When user clicks on the back arrow in the Popover, we need to "up a level" 
       * in our model. We will pop an entry off the [_aCurrentPropertyPath]{@link com.mitchbarry.controls.lib.PopoverHelper._aCurrentPropertyPath}
       * array, and update the title of the Popover with output of [getCurrentPropertyPath(true)]{@link com.mitchbarry.controls.lib.PopoverHelper.getCurrentPropertyPath}.
       * 
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      goUpperLevel: function (iDepth) {
        if (this._aCurrentPropertyPath.length > 1) {
          this._aCurrentPropertyPath.pop();
          this._setPropertyTitle(this.getCurrentPropertyPath(true));
        } else {
          $.sap.log.warning('com.mitchbarry.controls.ModelInspector: Already at highest level of property tree');
        }
        return this;
      },

      /**
       * Go Lower Level
       * @function
       * 
       * When user clicks into an object property in the Popover, we need to "down a level" 
       * in our model. Push selected property name into 
       * [_aCurrentPropertyPath]{@link com.mitchbarry.controls.lib.PopoverHelper._aCurrentPropertyPath}.
       * 
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      goLowerLevel: function (sPath) {
        this._aCurrentPropertyPath.push(sPath);
        return this;
      },

      /**
       * Get Default i18n Value
       * @function
       * 
       * If an i18n string is not found, this method will 
       * return a value from <code>this._mDefaultI18nValues</code> 
       * hashmap of i18n keys and default text values.
       * 
       * @param {string} sKey - i18n Key
       * @returns {string} sText - Default text (if exists), or empty string if not found
       */
      getDefaultI18nValue: function (sKey) {
        var mI18nValues = this._mDefaultI18nValues;
        var sText = mI18nValues[sKey] || '';
        if (!sText) {
          $.sap.log.warning('com.mitchbarry.controls.ModelInspector: No default text for ' + sKey);
        }
        return sText;
      },

      /**
       * Get i18n Value
       * @function
       * 
       * In order to retrieve valid i18n value, the ResourceBundle model 
       * should have name 'i18n'.
       * 
       * @param {string} sKey - key of i18n text entry
       * @returns {string} sText - i18n Text (or default value passed in)
       */
      getI18nValue: function (sKey) {
        var sI18nValue = null;
        var sDefaultText = this.getDefaultI18nValue(sKey);
        var oContext = this.getContext();

        if (oContext) {
          var sI18nModelName = this._getId('i18nModelName');
          var oResourceBundle = oContext.getModel(sI18nModelName);
          if (oResourceBundle) {
            sI18nValue = oResourceBundle.getProperty(sKey);
            if (sI18nValue === sKey) { // ResourceBundle will return key if not found
              sI18nValue = null;
            }
          }
        } else {
          $.sap.log.debug('com.mitchbarry.controls.ModelInspector: Not able to acquire ResourceBundle (missing Context), will use ' + sDefaultText);
        }
        return sI18nValue || sDefaultText;
      },

      /**
       * Get Current Model Name
       * @function
       * 
       * @returns {string} sCurrentModelName - currently selected model
       */
      getCurrentModelName: function () {
        return this._sCurrentModelName;
      },

      /**
       * Set Current Model Name
       * @function
       * 
       * @param {string} sModelName - currently selected model
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      setCurrentModelName: function (sModelName) {
        this._sCurrentModelName = sModelName;
        return this;
      },

      /**
       * Get NavContainer
       * @function
       * 
       * Get instance of NavContainer from Popover
       * 
       * @returns {sap.m.NavContainer} oNavCon - instance of NavContainer
       */
      _getNavContainer: function () {
        var sNavConId = this._getId('NavContainerId');
        var sFragmentId = this._getId('FragmentId');
        var oNavCon = Fragment.byId(sFragmentId, sNavConId);
        return oNavCon;
      },

      /**
       * Navigate To
       * @function
       * 
       * @param {string} sPageId - Id of page to navigate the internally used Popover's Navigation Container to
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      _navigateTo: function (sPageId) {
        var sFragmentId = this._getId('FragmentId');
        var oNavCon = this._getNavContainer();
        var oNextPage = Fragment.byId(sFragmentId, sPageId);

        if (!oNextPage) {
          $.sap.log.error('com.mitchbarry.controls.ModelInspector: Cannot navigate to page in popover - ' + sPageId);
        } else {
          oNavCon.to(oNextPage);
        }
        return this;
      },

      /**
       * Set Property Title
       * @function
       * 
       * Typically used to set property path in title area.
       * 
       * @param {string} sTitle - title to set on Popover page
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      _setPropertyTitle: function (sTitle) {
        var sFragmentId = this._getId('FragmentId');
        var sPropertyPageId = this._getId('PropertyPageId');
        var oPropertiesPage = Fragment.byId(sFragmentId, sPropertyPageId);
        oPropertiesPage.setTitle(sTitle);
        return this;
      },

      /**
       * Get Popover Control
       * @function
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
        var sFragmentId = this._getId('FragmentId');

        if (!oPopover) {
          oPopover = sap.ui.xmlfragment(
            sFragmentId,
            'com.mitchbarry.controls.lib.ModelInspectorPopover',
            this);
          oModelInspector.setAggregation("_popover", oPopover);
        }

        return oPopover;
      },

      /**
       * Set ModelInspector
       * @function
       * 
       * This method is called by [ModelInspector.constructor]{@link com.mitchbarry.controls.ModelInspector.constructor} to 
       * allow this library to have access to the ModelInspector's own [ModelHelper]{@link com.mitchbarry.controls.lib.ModelHelper} instance.
       * 
       * @param {com.mitchbarry.controls.ModelInspector} oModelInspector - primary instance of ModelInspector
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      setModelInspector: function (oModelInspector) {
        this._oModelInspector = oModelInspector;
        return this;
      },

      /**
       * Get Model Inspector
       * @function
       * 
       * @returns {com.mitchbarry.controls.ModelInspector} oModelInspector - primary instance of ModelInspector
       */
      getModelInspector: function () {
        return this._oModelInspector;
      },

      /**
       * Set Popover Model
       * @function
       * 
       * @param {sap.ui.model.json.JSONModel} oModel - JSONModel used to populate data for the Popover control
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      setPopoverModel: function (oModel) {
        var sPopoverModelName = this._getId('PopoverModelName');
        this._oPopoverModel = oModel;
        this.getContext().setModel(this._oPopoverModel, sPopoverModelName);
        return this;
      },

      /**
       * Get Popover Model
       * @function
       * 
       * Grabs Popover Model from [.getContext]{@link com.mitchbarry.controls.lib.PopoverHelper.getContext}
       * 
       * @returns {sap.ui.model.json.JSONModel} oModel - JSONModel used to populate data for the Popover control
       */
      getPopoverModel: function () {
        var sPopoverModelName = this._getId('PopoverModelName');
        return this.getContext().getModel(sPopoverModelName);
      },

      /**
       * Get Model Helper
       * 
       * @returns {com.mitchbarry.controls.lib.ModelHelper} oModelHelper - instance of ModelHelper
       */
      getModelHelper: function () {
        return this.getModelInspector().getModelHelper();
      },

      /**
       * Set Models
       * 
       * Called by ModelInspector instance to populate the internal JSONModel with 
       * [ModelInfo]{@link com.mitchbarry.controls.lib.ModelInfo} objects.
       * 
       * @param {com.mitchbarry.controls.lib.ModelInfo[]} aModels - Model information to populate view
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      setModels: function (aModels) {
        if (aModels.length >= 0) {
          var oModel = this.getPopoverModel();
          oModel.setProperty('/Models', aModels);
        }
        return this;
      },

      /**
       * Open By
       * 
       * Retrieve the internal Popover aggregation and call <code>openBy</code> 
       * with instance of sap.m.Button used by ModelInspector control.
       *  
       * @param {sap.ui.core.Control} oControl - control instance to open Popover next to
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      openBy: function (oControl) {
        if (!oControl) {
          $.sap.log.error('com.mitchbarry.controls.ModelInspector: Cannot display Popover without a control to relate it to.');
          return null;
        }
        var oPopover = this.getPopoverControl();
        oPopover.openBy(oControl);
        if (this.getCurrentModelName()) {
          this._setInspectingModel(this.getCurrentModelName());
          this._loadPropertiesAtDepth()
        }
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
        this._setInspectingModel(sModelName);
        this._loadPropertiesAtDepth();
        this._setPropertyTitle(this.getCurrentPropertyPath(true));
        this._navigateTo('properties');
        return;
      },

      /**
       * onPropertyPress
       * 
       * When user clicks on a row of a property that is an object, 
       * load the next level of properties into the List.
       * 
       * @event
       */
      onPropertyPress: function (oEvent) {
        var sPropertyName = oEvent.getSource().data().PropertyName;
        if (!sPropertyName) {
          $.sap.log.error('com.mitchbarry.controls.ModelInspector: Unable to parse PropertyName');
          return;
        }
        this.goLowerLevel(sPropertyName);
        this._loadPropertiesAtDepth();
        this._setPropertyTitle(this.getCurrentPropertyPath(true));
        return;
      },

      /**
       * onModelRefresh
       * 
       * If user clicks the Refresh button, retrieve the model instance
       * and call <code>.refresh(true)</code> to update the view.
       * 
       * @event
       */
      onModelRefresh: function (oEvent) {
        var oModelHelper = this.getModelHelper();
        oModelHelper.getModel(this.getCurrentModelName()).refresh(true);
        this._loadPropertiesAtDepth();
      },

      /**
       * onBindingModeChange
       * 
       * When user clicks the BindingMode button, allow toggling 
       * between OneWay and TwoWay binding modes. 
       * 
       * @event
       */
      onBindingModeChange: function (oEvent) {
        var oModelHelper = this.getModelHelper();
        var sModelName = this.getCurrentModelName();
        var oModel = oModelHelper.getModel(sModelName);
        var oPopoverModel = this.getPopoverModel();
        switch (oModel.getDefaultBindingMode()) {
          case BindingMode.TwoWay: 
            oModel.setDefaultBindingMode(BindingMode.OneWay);
            break;
          case BindingMode.OneWay:
            oModel.setDefaultBindingMode(BindingMode.TwoWay);
            break;
          default:
            break;
        }

        oModel.refresh(true);
        this._setInspectingModel(sModelName);

        this._loadPropertiesAtDepth();
        return;
      },

      /**
       * onClosePopover
       * 
       * Close the Popover window
       * 
       * @event
       */
      onClosePopover: function (oEvent) {
        this.getPopoverControl().close();
      },

      /**
       * Set Inspecting Model
       * 
       * @param {string} sModelName - Model name to set as InspectingModel 
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      _setInspectingModel: function (sModelName) {
        var oPopoverModel = this.getPopoverModel();
        var oModelHelper = this.getModelHelper();
        var oModelInfo = oModelHelper.getModelInfo(sModelName);
        var oPopoverModelData = oPopoverModel.getProperty('/');
        oPopoverModelData.InspectingModel = oModelInfo;
        oPopoverModel.setProperty('/', oPopoverModelData);
        oPopoverModel.refresh(true);
        return this;
      },

      /**
       * Load Properties (at Depth)
       * @function
       * 
       * This method will:
       *   - Get sap.m.List from Popover holding property list items
       *   - Load selected model
       *   - Call external method (this._getControlArray) to build the sap.m.InputListItem array
       *   - Destroy current InputListItems in current view
       *   - Iterate though sap.m.InputListItem objects and add them to the sap.m.List
       * 
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oThis - Reference to <code>this</code> in order to allow method chaining
       */
      _loadPropertiesAtDepth: function () {
        var sFragmentId = this._getId('FragmentId');
        var sPropertyListId = this._getId('PropertyListId');
        var sPropertyPageId = this._getId('PropertyPageId');

        var oPropertyList = Fragment.byId(sFragmentId, sPropertyListId);
        var sModelName = this.getCurrentModelName();
        var oModelHelper = this.getModelHelper();
        var oModel = oModelHelper.getModel(sModelName);
        var oModelData = oModel.getProperty(this.getCurrentPropertyPath(false));
        var aProperties = this._getControlArray(oModelData);

        var oPropertiesPage = Fragment.byId(sFragmentId, sPropertyPageId);
        oPropertyList.destroyItems();

        for (var i = 0; i < aProperties.length; i++) {
          oPropertyList.addItem(aProperties[i]);
        }

        return this;
      },

      /**
       * Get Control Array
       * @function
       * 
       * This method will:
       *   - Load selected model data and iterate through each property in it
       *   - Call external method (this._createListItemFromProperty) to build the sap.m.InputListItem array
       * 
       * @param {object} oModelData - data from current model object (at property depth)
       * @returns {sap.m.InputListItem[]} aCurrentDepthProperties - List of InputListItem controls to render in view
       */
      _getControlArray: function (oModelData) {
        var aCurrentDepthProperties = [];
        for (var sPropertyName in oModelData) {
          if (oModelData.hasOwnProperty(sPropertyName)) {
            var oProperty = oModelData[sPropertyName];
            var oListItem = this._createListItemFromProperty(sPropertyName, oProperty);
            if (oListItem) {
              aCurrentDepthProperties.push(oListItem);
            }
          }
        }
        return aCurrentDepthProperties;
      },

      /**
       * Create List Item From Property
       * @function
       * 
       * Based on the property's type, build a new control of <code>sap.m.InputListItem</code> 
       * to display (but allow modification if TwoWay binding enabled) the property in a 
       * logical way - <code>sap.m.Input</code> if string/integer, <code>sap.m.Switch</code> if boolean, etc.
       * 
       * @param {string} sPropertyName - Property Name currently visualizing as an sap.m.InputListItem
       * @param {object} vProperty - value of property (of any type)
       * @returns {sap.m.InputListItem} oListItem - Control to render in view with current property data
       */
      _createListItemFromProperty: function (sPropertyName, vProperty) {
        var sModelName = this.getCurrentModelName();
        var sPropertyPath = this.getCurrentPropertyPath(true);
        var oControl = null;
        var sListItemType = 'Inactive';
        var fnOnPress = function () { };

        // trim trailing slash
        if (sPropertyPath.substring(sPropertyPath.length, sPropertyPath.length - 1) === '/') {
          sPropertyPath = sPropertyPath.slice(0, -1);
        }

        var sPropertyBindingPath = '{' + sPropertyPath + '/' + sPropertyName + '}';

        switch (typeof vProperty) {
          case "function":
            // do nothing ... 
            return null;
          case "object":
            // allow drill-down to next level
            sListItemType = 'Navigation';
            fnOnPress = this.onPropertyPress;
            break;
          case "number":
            oControl = new sap.m.Input({
              value: sPropertyBindingPath,
              type: 'Number'
            });
            break;
          case "string":
            oControl = new sap.m.Input({
              value: sPropertyBindingPath
            });
            break;
          case "boolean":
            oControl = new sap.m.Switch({
              state: sPropertyBindingPath,
              customTextOn: ' ',
              customTextOff: ' '
            });
            break;
          default:
            var sPropertyType = typeof vProperty;
            // do nothing ... not handled
            break;
        }

        var oListItem = new InputListItem({
          label: sPropertyName,
          tooltip: sPropertyName,
          type: sListItemType,
          press: fnOnPress.bind(this),
          content: (oControl) ? [oControl] : []
        });
        oListItem.data('PropertyName', sPropertyName);

        return oListItem;
      }

    });

  return PopoverHelper;
});