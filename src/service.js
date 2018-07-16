/* exported GameService */
// src/service.js
//
// Copyright (c) 2017 Endless Mobile Inc.
//
// This file contains all our integrations with other D-Bus services
// and shim methods to call out to them.
//
const {CodingGameService, Gio, GObject} = imports.gi;

// Encapsulate a CodingGameServiceProxy and expose just the methods
// that the rest of the discovery center will need.
//
var GameService = GObject.registerClass(class GameService extends GObject.Object {
    _init(params) {
        super._init(params);

        // Initialise this service straight away, we need it for the
        // discovery center to function
        this._service = CodingGameService.CodingGameServiceProxy.new_for_bus_sync(
            Gio.BusType.SESSION,
            Gio.DBusProxyFlags.DO_NOT_AUTO_START_AT_CONSTRUCTION,
            'com.endlessm.CodingGameService.Service',
            '/com/endlessm/CodingGameService/Service',
            null);
    }

    startMission(mission) {
        this._service.call_start_mission(mission, null, (source, result) => {
            try {
                this._service.call_start_mission_finish(result);
            } catch (e) {
                logError(e, `Starting mission ${mission} on CodingGameService failed`);
            }
        });
    }
});

