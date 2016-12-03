sap.ui.define([
	"sap/m/Button",
  "sap/m/ButtonRenderer",
  "sap/m/ResponsivePopover"
], function (Button, ButtonRenderer, ResponsivePopover) {
	"use strict";
 
	var ModelInspectorButton = Button.extend("com.mitchbarry.controls.ModelInspector", {
 
		metadata: {
			properties: {
			},
			aggregations: {
        _popover: { type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden" }
			},
			events: {
			}
		},
 
		init: function () {
			this.setAggregation("_popover", new ResponsivePopover({
			}));
		},

    ontap: function(oEvent) {
      /* TODO: Show ResponsivePopover */
      //var oPopover = this.getAggregation('_popover');
      //oPopover.openBy(this);
      Button.prototype.ontap.apply(this, arguments);
    },
 
		renderer: ButtonRenderer.render
	});

  return ModelInspectorButton;
 
});