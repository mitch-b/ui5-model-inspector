sap.ui.define([
  'jquery.sap.global',
  'sap/ui/base/Object',
  'sap/ui/core/IconPool',
  'com/mitchbarry/controls/lib/ModelInfo'
], function ($, UI5Object, IconPool, ModelInfo) {
  "use strict";

  var ModelHelper = UI5Object.extend("com.mitchbarry.controls.lib.ModelHelper", {
    /**
     * Context object
     * @property {object} oContext - Context object where Models can be pulled 
     */
    _oContext: null,

    /**
     * constructor
     * 
     * When the ModelHelper is created, a Context object 
     * can optionally be passed in. 
     * 
     * @param {object} oContext - View context where Models can be pulled
     */
    constructor: function (oContext) {
      this.setContext(oContext);
    },

    /**
     * Set Context
     * 
     * Set current view context object so that Models can be pulled
     * @param {object} oContext - Context object
     * @returns {com.mitchbarry.controls.lib.ModelHelper} oThis - this object (for method chaining)
     */
    setContext: function (oContext) {
      this._oContext = oContext;
      return this;
    },

    /**
     * Get Context
     * 
     * Get current context object where Models can be pulled
     * @returns {object} oContext - Context object
     */
    getContext: function () {
      return this._oContext;
    },

    /**
     * Get Active Models
     * 
     * Iterate through the context and get information from each Model that is 
     * available from our current <code>oContext</code> object.
     * 
     * This function will not include the <code>__ModelInspector</code> model used 
     * to internally support this custom control.
     * 
     * @param {object} [oContext] - Context object which should provide a .getModel method. 
     *                              If omitted, context will be retrieved from context set in constructor
     * @returns {com.mitchbarry.controls.lib.ModelInfo[]} aModels
     */
    getActiveModels: function (oContext) {
      var aModels = [];
      var aModelNames = [];
      oContext = oContext || this.getContext();

      if (!oContext) {
        $.sap.log.warning('com.mitchbarry.controls.ModelInspector: No context available to find models');
        return [];
      }

      var aNames = this._getModelNamesFromContext(oContext);
      if (aNames.length) {
        aModelNames = aModelNames.concat(aNames);
      }

      $.each(aNames, function (i, sModelName) {
        if (sModelName.indexOf('__ModelInspector') === 0) {
          return;
        }
        var oModelInfo = this.getModelInfo(sModelName);
        aModels.push($.extend(true, {}, oModelInfo));
      }.bind(this));

      return aModels;
    },

    /**
     * Get model names from context object
     * 
     * Use UI5 internal properties to identify models available
     * to inspect. Since there is no public API to retrieve these 
     * model names (to my knowledge), we access internal properties
     * directly.
     * 
     * @param {sap.ui.base} oContext - Context object to inspect for available models
     * @returns {string[]} aModelNames - models available within provided context 
     */
    _getModelNamesFromContext: function (oContext) {
      var aModelNames = [];
      // 1. Get Models directly assigned to context object
      if (oContext.oModels) {
        for (var sModelName in oContext.oModels) {
          aModelNames.push(sModelName);
        }
      }
      // 2. Get Models propogated down to this context object
      if (oContext.oPropagatedProperties && oContext.oPropagatedProperties.oModels) {
        for (var sModelName in oContext.oPropagatedProperties.oModels) {
          aModelNames.push(sModelName);
        }
      }
      return $.unique(aModelNames).sort();
    },

    /**
     * Get Model Info
     * 
     * Populates a new ModelInfo object which has information such as:
     *   - sIconUri
     *   - Model Class Name
     * 
     * This ModelInfo object is what will ultimately be pushed to the 
     * ModelInspector popover.
     * 
     * @param {string} sModelName - Model name to retrieve full information about
     * @returns {com.mitchbarry.controls.lib.ModelInfo} oModelInfo - Model Information
     */
    getModelInfo: function (sModelName) {
      var oModelInfo = new ModelInfo();
      var oModel = this.getModel(sModelName);
      var mInfo = this.getObjectInformation(oModel);
      var sIconUri = this.getIconBasedOnModelClass(mInfo.ClassName);

      oModelInfo
        .setModelName(sModelName)
        .setDisplayName(sModelName)
        .setModel(oModel)
        .setClassName(mInfo.ClassName)
        .setIconUri(sIconUri)
        .setBindingMode(oModel.getDefaultBindingMode());

      return oModelInfo;
    },

    /**
     * Get Model
     * 
     * This function will attempt to retrieve the model 
     * from the context.
     * 
     * @param {string} sModelName - name of model to retrieve
     * @param {object} [oContext] - Context object which should provide a .getModel method. 
     *                              If omitted, context will be retrieved from context set in constructor
     * @returns {sap.ui.model.Model} oModel - Model retrieved from Context
     */
    getModel: function (sModelName, oContext) {
      oContext = oContext || this.getContext();
      if (!oContext) {
        $.sap.log.error('com.mitchbarry.controls.ModelInspector: No context available to get model');
        return null;
      }
      var oModel = oContext.getModel(sModelName);
      if (!oModel) {
        $.sap.log.error('com.mitchbarry.controls.ModelInspector: Cannot find model ' + sModelName);
        return null;
      }
      return oModel;
    },

    /**
     * Get Model Information
     * 
     * Useful to determine what type of model the user is inspecting.
     * 
     * @param {sap.ui.base.Object} oObject - Object to pull information for
     * @returns {hashmap} mInfo - Information about object with properties: ClassName, Id, Icon
     */
    getObjectInformation: function (oObject) {
      var mInfo = {
        ClassName: '',
        Id: ''
      };

      if (!oObject) {
        $.sap.log.warning('com.mitchbarry.controls.ModelInspector: No object passed to function');
        return null;
      }

      if (oObject.getMetadata) {
        var oMetadata = oObject.getMetadata();
        mInfo.ClassName = oMetadata._sClassName;
      }
      if (oObject.getId) {
        mInfo.Id = oObject.getId();
      }

      return mInfo;
    },

    /**
     * Get Icon Based on Model Class
     * 
     * Depending on type of model (JSON/XML/OData/Resource),
     * show a different icon in the sap.m.List.
     * 
     * @param {string} sClassName - full namespace of class (ex, sap.ui.model.json.JSONModel)
     * @returns {string} sIconUri - Icon URI to be used by icon attribute of UI object
     */
    getIconBasedOnModelClass: function (sClassName) {
      var sIcon;
      switch (sClassName) {
        case 'sap.ui.model.json.JSONModel':
        case 'sap.ui.model.xml.XMLModel':
          sIcon = 'tree';
          break;
        case 'sap.ui.model.odata.ODataModel':
        case 'sap.ui.model.odata.v2.ODataModel':
        case 'sap.ui.model.odata.v4.ODataModel':
          sIcon = 'database';
          break;
        case 'sap.ui.model.resource.ResourceModel':
          sIcon = 'post';
          break;
        default:
          sIcon = 'product';
          break;
      }
      return IconPool.getIconURI(sIcon);
    }

  });

  return ModelHelper;
});