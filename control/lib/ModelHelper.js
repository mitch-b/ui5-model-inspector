sap.ui.define([
  'jquery.sap.global',
  'sap/ui/base/Object',
  'sap/ui/core/IconPool',
  'com/mitchbarry/controls/lib/ModelInfo'
], function ($, UI5Object, IconPool, ModelInfo) {
  "use strict";

  var ModelHelper = UI5Object.extend("com.mitchbarry.controls.lib.ModelHelper", {
    _oContext: null,

    constructor: function (oContext) {
      this.setContext(oContext);
    },

    setContext: function (oContext) {
      this._oContext = oContext;
    },

    getContext: function () {
      return this._oContext;
    },

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

      $.each(aNames, function(i, sModelName) {
        if (sModelName.indexOf('__ModelInspector') === 0) {
          return;
        }
        var oModelInfo = this._getModelInfo(sModelName);
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

    _getModelInfo: function(sModelName) {
      var oModelInfo = new ModelInfo();
      var oModel = this.getModel(sModelName);
      var mInfo = this.getObjectInformation(oModel);
      var sIconUri = this.getIconBasedOnModelClass(mInfo.ClassName);
      oModelInfo.setModelName(sModelName);
      oModelInfo.setDisplayName(sModelName);
      oModelInfo.setModel(oModel);
      oModelInfo.setClassName(mInfo.ClassName);
      oModelInfo.setIconUri(sIconUri);
      return oModelInfo;
    },

    getModel: function(sModelName, oContext) {
      oContext = oContext || this.getContext();
      if (!oContext) {
        $.sap.log.warning('com.mitchbarry.controls.ModelInspector: No context available to get model');
        return null;
      }
      return oContext.getModel(sModelName); 
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

      /* Another, manual way ...

      var oInfoParseRegex = /([a-zA-Z\.]+)\s([a-zA-Z\.]+)#?(.*)?/; // first group: Inherits, second group: ClassName, third group: id
      
      var sObjectInfo = oObject.toString();
      var aParts = sObjectInfo.match(oInfoParseRegex);
      if (aParts && aParts.length === 4) {
        mInfo.InheritsFrom = aParts[1];
        mInfo.ClassName = aParts[2];
        mInfo.Id = aParts[3];
      }

      */

      return mInfo;
    },

    getIconBasedOnModelClass: function(sClassName) {
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