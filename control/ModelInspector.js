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
       * init
       * 
       * When ModelInspector is started, set this instance to 
       * the PopoverHelper so that the PopoverHelper can access things like 
       * the ModelHelper library instance. It is shared so that the Context object 
       * acquired by the ModelInspector control is shared between all helper 
       * libraries.
       * 
       */
      init: function () {
        this._oPopoverHelper.setModelInspector(this);
      },

      /**
       * Get instance of ModelHelper library
       * @returns {com.mitchbarry.controls.lib.ModelHelper} oModelHelper - ModelHelper library
       */
      getModelHelper: function () {
        return this._oModelHelper;
      },

      /**
       * Get instance of PopoverHelper library
       * @returns {com.mitchbarry.controls.lib.PopoverHelper} oPopoverHelper - PopoverHelper library
       */
      getPopoverHelper: function () {
        return this._oPopoverHelper;
      },

      /**
       * On Tap event fired
       * 
       * 
       * @param {sap.ui.base.Event} oEvent - Event information
       * @event
       */
      ontap: function (oEvent) {
        var oContext = this;
        var oModelHelper = this.getModelHelper();
        var oPopoverHelper = this.getPopoverHelper();

        /* Initialize Helpers */
        if (!oModelHelper.getContext()) {
          oModelHelper.setContext(oContext);
        }
        if (!oPopoverHelper.getContext()) {
          oPopoverHelper.setContext(oContext);
        }

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