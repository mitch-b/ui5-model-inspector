sap.ui.define([
  "sap/m/Button",
  "sap/m/ButtonRenderer",
  "sap/m/ResponsivePopover",
  "com/mitchbarry/controls/lib/ModelHelper",
  "com/mitchbarry/controls/lib/PopoverHelper"
], function (Button, ButtonRenderer, ResponsivePopover, ModelHelper, PopoverHelper) {
  "use strict";

  /**
   * ModelInspector Button
   * 
   * @class
   * ModelInspector primary entry point as a custom control. 
   * 
   * @public
   * @extends sap.m.Button
   * @alias com.mitchbarry.controls.ModelInspector
   */
  var ModelInspectorButton = Button.extend("com.mitchbarry.controls.ModelInspector",
    /** @lends com.mitchbarry.controls.ModelInspector.prototype */
    {
      _oModelHelper: new ModelHelper(),
      _oPopoverHelper: new PopoverHelper(),
      _sId: '',

      metadata: {
        properties: {
        },
        aggregations: {
          _popover: { type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden" }
        },
        events: {
        }
      },

      /**
       * Get instance of ModelHelper library
       * 
       * @param {object} [oContext] - Context object
       * @returns {com.mitchbarry.controls.lib.ModelHelper} oModelHelper - ModelHelper library
       * 
       * @function 
       */
      getModelHelper: function (oContext) {
        if (oContext) {
          this._oModelHelper.setContext(oContext);
        }
        return this._oModelHelper;
      },

      /**
       * Get instance of PopoverHelper library
       * 
       * @param {object} [oContext] - Context object
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oPopoverHelper - PopoverHelper library
       * 
       * @function 
       */
      getPopoverHelper: function (oContext) {
        if (oContext) {
          this._oPopoverHelper.setContext(oContext);
          this._oPopoverHelper.setModelInspector(oContext);
        }
        return this._oPopoverHelper;
      },

      /**
       * On Tap event fired
       * 
       * @param {sap.ui.base.Event} oEvent - Event information
       * 
       * @event
       */
      ontap: function (oEvent) {
        var oContext = this;
        var oModelHelper = this.getModelHelper(oContext);
        var oPopoverHelper = this.getPopoverHelper(oContext);

        var aModels = oModelHelper.getActiveModels();

        oPopoverHelper
          .setModels(aModels)
          .openBy(this);

        Button.prototype.ontap.apply(this, arguments);
      },

      renderer: ButtonRenderer.render
    });

  return ModelInspectorButton;

});