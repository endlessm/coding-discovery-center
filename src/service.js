// src/service.js
//
// Copyright (c) 2017 Endless Mobile Inc.
//
// This file contains all our integrations with other D-Bus services
// and shim methods to call out to them.
//
const CodingGameService = imports.gi.CodingGameService;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;

const Lang = imports.lang;

// Encapsulate a CodingGameServiceProxy and expose just the methods
// that the rest of the discovery center will need.
//
// eslint-disable-next-line no-unused-vars
const GameService = new Lang.Class({
    Name: 'GameService',
    Extends: GObject.Object,

    _init: function(params) {
        this.parent(params);

        // Initialise this service straight away, we need it for the
        // discovery center to function
        this._service = CodingGameService.CodingGameServiceProxy.new_for_bus_sync(
            Gio.BusType.SESSION,
            Gio.DBusProxyFlags.DO_NOT_AUTO_START_AT_CONSTRUCTION,
            'com.endlessm.CodingGameService.Service',
            '/com/endlessm/CodingGameService/Service',
            null);
    },

    startMission: function(mission) {
        this._service.call_start_mission(mission, null, Lang.bind(this, function(source, result) {
            try {
                this._service.call_start_mission_finish(result);
            } catch (e) {
                logError(e,
                         'Starting mission ' +
                         mission +
                         ' on CodingGameService failed');
            }
        }));
    }
});

