/*
 * Copyright 2012 Denis Washington <denisw@online.de>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  var _ = require('underscore');
  var Backbone = require('backbone');
  var avatarFallback = require('util/avatarFallback');
  var template = require('text!templates/content/editChannel.html');

  var EditChannelStream = Backbone.View.extend({
    className: 'stream clearfix',

    events: {
      'click .save': 'save',
      'click .discard': 'render',
      'click .twoStepConfirmation .stepOne': '_renderConfirmButton',
      'click .twoStepConfirmation .stepTwo': '_deleteAccount'
    },

    initialize: function() {
      this.fields = 
        {
          'channel_name': 'title', 
          'channel_description': 'description', 
          'channel_public_access': 'access_model',
          'channel_default_role': 'default_affiliation' 
        };
      this.model.bind('change', this.render, this);
    },

    render: function() {
      this.$el.html(_.template(template, {
        metadata: this.model
      }));

      if (this.model) {
        this._fillCheckbox();
        this._selectDefaultRole();
      } else {
        this._removeDeleteButton();
      }
    },

    _removeDeleteButton: function() {
      this.$('.floatLeft').remove();
    },

    _fillCheckbox: function() {
      this._check(this.$('#channel_public_access'), this._hasPublicAccess());
    },

    _check: function(element, value) {
      if (element) {
        element.attr('checked', value);
      }
    },

    _isChecked: function(element) {
      if (element) {
        var checked = element.attr('checked');
        if (checked && checked === 'checked') {
          return 'true';
        }
      }

      return 'false';
    },

    _hasPublicAccess: function() {
      return this.model.accessModel() === 'open';
    },

    _selectDefaultRole: function() {
      if (this.model.defaultAffiliation() === 'publisher') {
        $('#channel_default_role').val('followerPlus');
      }
    },

    _renderConfirmButton: function() {
      this.$('.twoStepConfirmation').toggleClass('confirmed');
    },

    _deleteAccount: function() {
      //TODO delete account
    },

    save: function(event) {
      if (!this.model) {
        // Create new ChannelMetadata
      }

      this._saveAvatar();
      this._setTextFields();
      this._setAccessModel();
      this._setDefaultRole();

      this.model.save({}, {credentials: this.options.user.credentials});      
    },

    _saveAvatar: function() {

    },

    _setTextFields: function() {
      // FIXME not all fields are handled by HTTP API
      // var textFields = ['channel_name', 'channel_description', 'channel_status', 'channel_location'];
      var textFields = ['channel_name', 'channel_description'];
      for (var i = 0; i < textFields.length; i++) {
        var content = this.$('#' + textFields[i]).val();
        this.model.set(this.fields[textFields[i]], content);
      }
    },

    _setAccessModel: function() {
      var accessField = this.fields['channel_public_access'];
      if (this._isChecked(this.$('#channel_public_access'))) {
        this.model.set(accessField, 'open');  
      } else {
        this.model.set(accessField, 'whitelist');
      }
    },

    _setDefaultRole: function() {
      var defaultRoleField = this.fields['channel_default_role'];
      if (this.$('#channel_default_role').val() == 'followerPlus') {
        this.model.set(defaultRoleField, 'publisher');  
      } else {
        this.model.set(defaultRoleField, 'member');
      }      
    }
  });

  return EditChannelStream;
});
