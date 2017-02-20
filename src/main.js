// src/main.js
//
// Copyright (c) 2017 Endless Mobile Inc.
//
// This file is the file first run by the entrypoint to the
// coding-discovery-center package.
//
pkg.initGettext();
pkg.initFormat();
pkg.require({
    Gdk: '3.0',
    GdkPixbuf: '2.0',
    Gtk: '3.0',
    Gio: '2.0',
    GLib: '2.0',
    GObject: '2.0'
});

const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;

function load_style_sheet(resourcePath) {
    let provider = new Gtk.CssProvider();
    provider.load_from_resource(resourcePath);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
                                             provider,
                                             Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

const CodingDiscoveryCenterMainWindow = new Lang.Class({
    Name: 'CodingDiscoveryCenterMainWindow',
    Extends: Gtk.ApplicationWindow,
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/main.ui',

    _init: function(params) {
        this.parent(params);

        let header = new Gtk.HeaderBar({
            visible: true,
            title: GLib.get_application_name(),
            show_close_button: true
        });
        this.set_titlebar(header);
    }
});


const CodingDiscoveryCenterApplication = new Lang.Class({
    Name: 'CodingDiscoveryCenterApplication',
    Extends: Gtk.Application,

    _init: function() {
        this._mainWindow = null;

        this.parent({ application_id: pkg.name });
        GLib.set_application_name(_("Coding Discovery Center"));
    },

    vfunc_startup: function() {
        this.parent();

        let settings = Gtk.Settings.get_default();
        settings.gtk_application_prefer_dark_theme = true;

        load_style_sheet('/com/endlessm/Coding/DiscoveryCenter/application.css');
    },

    vfunc_activate: function() {
        if (!this._mainWindow)
            this._mainWindow = new CodingDiscoveryCenterMainWindow({
                application: this
            });

        this._mainWindow.present();
    },

    vfunc_dbus_register: function(conn, object_path) {
        this.parent(conn, object_path);

        return true;
    },

    vfunc_dbus_unregister: function(conn, object_path) {
        this.parent(conn, object_path);
    },
});


function main(argv) { // eslint-disable-line no-unused-vars
    return (new CodingDiscoveryCenterApplication()).run(argv);
}
