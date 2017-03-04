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
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;

const Service = imports.service;

const LessonContent = [
    {
        name: 'Terminal',
        subtitle: 'Dig into the system',
        tags: ['poweruser', 'code', 'os', 'terminal'],
        action: {
            name: 'start-mission',
            data: {
                name: 'terminalintro'
            }
        }
    },
    {
        name: 'Processing',
        subtitle: 'Code can be beautiful',
        tags: ['visual', 'code', 'processing'],
        action: {
            name: 'start-mission',
            data: {
                name: 'processing'
            }
        }
    },
    {
        name: 'CodeView',
        subtitle: 'Sneak behind the screen',
        tags: ['javascript', 'code', 'os'],
        action: {
            name: 'start-mission',
            data: {
                name: 'weather'
            }
        }
    },
    {
        name: 'Python Console',
        subtitle: 'Use Python in the Terminal',
        tags: ['python', 'code', 'os', 'terminal'],
        action: {
            name: 'start-mission',
            data: {
                name: 'python'
            }
        }
    },
    {
        name: 'Python Functions',
        subtitle: 'Write some functions and classes with Python',
        tags: ['python', 'code', 'editor'],
        action: {
            name: 'start-mission',
            data: {
                name: 'python_functions'
            }
        }
    },
    {
        name: 'Shell extensions',
        subtitle: 'Customise your OS',
        tags: ['shell', 'code', 'os'],
        action: {
            name: 'start-mission',
            data: {
                name: 'shellextension'
            }
        }
    }
];

const Tags = [
    {
        title: 'Shell',
        name: 'shell'
    },
    {
        title: 'Code',
        name: 'code'
    },
    {
        title: 'Operating System',
        name: 'os'
    },
    {
        title: 'Editor',
        name: 'editor'
    },
    {
        title: 'Processing',
        name: 'processing'
    },
    {
        title: 'Python',
        name: 'python'
    },
    {
        title: 'Visual',
        name: 'visual'
    },
    {
        title: 'JavaScript',
        name: 'javascript'
    }
];


function load_style_sheet(resourcePath) {
    let provider = new Gtk.CssProvider();
    provider.load_from_resource(resourcePath);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
                                             provider,
                                             Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

// Each of these action dispatchers is always passed an object called 'services'
// which contains a mapping of any relevant services (for instance gameService)
// and data, which is per-action defined.
const _ACTION_DISPATCH = {
    'start-mission': function(services, data) {
        services.gameService.startMission(data.name);
    }
};

const DiscoveryContentItem = new Lang.Class({
    Name: 'DiscoveryContentItem',
    Extends: GObject.Object,
    Properties: {
        title: GObject.ParamSpec.string('title',
                                        '',
                                        '',
                                        GObject.ParamFlags.READWRITE |
                                        GObject.ParamFlags.CONSTRUCT_ONLY,
                                        ''),
        subtitle: GObject.ParamSpec.string('subtitle',
                                           '',
                                           '',
                                           GObject.ParamFlags.READWRITE |
                                           GObject.ParamFlags.CONSTRUCT_ONLY,
                                           ''),
    },

    _init: function(params, action, tags) {
        this.parent(params);

        this._action = action;
        this._tags = tags;
    },

    performAction: function(services) {
        return _ACTION_DISPATCH[this._action.name](services, this._action.data);
    },

    matchesAnyOfProvidedTags: function(tags) {
        return tags.some(Lang.bind(this, function(tag) {
            return this._tags.indexOf(tag) !== -1;
        }));
    },

    matchesSearchTerm: function(searchTerm) {
        let lowerSearchTerm = searchTerm.toLowerCase();
        let tagMatchesSearchTerm = this._tags.some(Lang.bind(this, function(tag) {
            return tag.indexOf(lowerSearchTerm) !== -1;
        }));
        let nameMatchesSearchTerm = (
            this.title.indexOf(lowerSearchTerm) !== -1
        );
        let subtitleMatchesSearchTerm = (
            this.subtitle.indexOf(lowerSearchTerm) !== -1
        );

        return (tagMatchesSearchTerm ||
                nameMatchesSearchTerm ||
                subtitleMatchesSearchTerm);
    }
});

const DiscoveryContentStore = new Lang.Class({
    Name: 'DiscoveryContentStore',
    Extends: Gio.ListStore,

    _init: function(params, contentItems) {
        params.item_type = DiscoveryContentItem.$gtype;

        this.parent(params);

        contentItems.forEach(Lang.bind(this, function(item) {
            this.append(new DiscoveryContentItem({
                title: item.name,
                subtitle: item.subtitle
            }, item.action, item.tags));
        }));
    },

    forEach: function(callback) {
        for (let i = 0; i < this.get_n_items(); ++i) {
            callback(this.get_item(i));
        }
    }
});

const CSSAllocator = (function() {
    let counter = 0;
    return function(properties) {
        let class_name = 'themed-widget-' + counter++;
        return [class_name, '.' + class_name + ' { ' +
        Object.keys(properties).map(function(key) {
            return key.replace('_', '-') + ': ' + properties[key] + ';';
        }).join(' ') + ' }'];
    };
})();

const AVAILABLE_COLORS = ['black', 'blue', 'green', 'purple', 'orange'];

const DiscoveryContentItemView = new Lang.Class({
    Name: 'DiscoveryContentItemView',
    Extends: Gtk.FlowBoxChild,
    Properties: {
        model: GObject.ParamSpec.object('model',
                                        '',
                                        '',
                                        GObject.ParamFlags.READWRITE |
                                        GObject.ParamFlags.CONSTRUCT_ONLY,
                                        DiscoveryContentItem.$gtype)
    },

    _init: function(params, action, tags) {
        params.width_request = 200;
        params.height_request = 200;

        this.parent(params);
        this.action = action;
        this.tags = tags;

        let contentOverlay = new Gtk.Overlay({
            visible: true
        });

        let contentBox = new Gtk.Box({
            width_request: 200,
            height_request: 200,
            visible: true
        });

        let colorIndex = Math.floor((Math.random() * 10) % AVAILABLE_COLORS.length);

        let contentBackgroundProvider = new Gtk.CssProvider();
        let contentBackgroundStyleContext = contentBox.get_style_context();
        let [className, backgroundCss] = CSSAllocator({
            background_color: AVAILABLE_COLORS[colorIndex]
        });
        contentBackgroundProvider.load_from_data(backgroundCss);
        contentBackgroundStyleContext.add_class(className);
        contentBackgroundStyleContext.add_class('background-box');
        contentBackgroundStyleContext.add_provider(contentBackgroundProvider,
                                      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

        let contentOverlayBox = new Gtk.Box({
            visible: true,
            orientation: Gtk.Orientation.VERTICAL
        });
        contentOverlayBox.get_style_context().add_class('overlay-contents');

        let contentOverlayLabelsBox = new Gtk.Box({
            visible: true,
            orientation: Gtk.Orientation.VERTICAL,
            vexpand: true,
            hexpand: true,
            valign: Gtk.Align.END
        });
        let itemTitleLabel = new Gtk.Label({
            visible: true,
            label: this.model.title,
            max_width_chars: 12,
            hexpand: false,
            halign: Gtk.Align.START,
            xalign: 0
        });
        let itemSubtitleLabel = new Gtk.Label({
            visible: true,
            label: this.model.subtitle,
            max_width_chars: 40,
            wrap: true,
            hexpand: false,
            halign: Gtk.Align.START,
            xalign: 0
        });
        itemTitleLabel.get_style_context().add_class('title');
        itemSubtitleLabel.get_style_context().add_class('subtitle');

        contentOverlayLabelsBox.add(itemTitleLabel);
        contentOverlayLabelsBox.add(itemSubtitleLabel);

        contentOverlayBox.add(contentOverlayLabelsBox);

        contentOverlay.add(contentBox);
        contentOverlay.add_overlay(contentOverlayBox);

        this.add(contentOverlay);

        this.get_style_context().add_class('content-item');
    }
});

const CodingDiscoveryCenterMainWindow = new Lang.Class({
    Name: 'CodingDiscoveryCenterMainWindow',
    Extends: Gtk.ApplicationWindow,
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/main.ui',
    Children: [
        'discovery-content',
        'content-views',
        'tag-selection-bar',
        'content-search'
    ],
    Properties: {
        discovery_content_store: GObject.ParamSpec.object('discovery-content-store',
                                                          '',
                                                          '',
                                                          GObject.ParamFlags.READWRITE |
                                                          GObject.ParamFlags.CONSTRUCT_ONLY,
                                                          DiscoveryContentStore.$gtype),
        game_service: GObject.ParamSpec.object('game-service',
                                               '',
                                               '',
                                               GObject.ParamFlags.READWRITE |
                                               GObject.ParamFlags.CONSTRUCT_ONLY,
                                               Service.GameService.$gtype)
    },

    _init: function(params) {
        this.parent(params);

        let header = new Gtk.HeaderBar({
            visible: true,
            title: GLib.get_application_name(),
            show_close_button: true
        });
        this.set_titlebar(header);

        // XXX: For some reason discovery_content.bind_model doesn't seem to
        // work. The callback gets invoked with null every time. Checked
        // the bindings and there doesn't seem to be anything wrong there
        // so either we are doing something wrong or there is a problem
        // deep within Gjs. In any event, we want to use the filter func
        // so we can't use bind_model anyway.
        //
        // For now we don't care about model updates, so just use forEach
        this.discovery_content_store.forEach(Lang.bind(this, function(item) {
            this.discovery_content.add(new DiscoveryContentItemView({
                visible: true,
                model: item,
                valign: Gtk.Align.START,
                halign: Gtk.Align.START
            }));
        }));

        this._toggledTags = Set();  // eslint-disable-line no-undef

        Tags.forEach(Lang.bind(this, function(tag) {
            let button = new Gtk.ToggleButton({
                label: tag.title,
                visible: true,
                draw_indicator: true
            });

            button.connect('toggled', Lang.bind(this, function() {
                if (button.active) {
                    this._toggledTags.add(tag.name);
                    this.discovery_content.invalidate_filter();
                } else {
                    this._toggledTags.delete(tag.name);
                    this.discovery_content.invalidate_filter();
                }
            }));
            this.tag_selection_bar.add(button);
        }));

        this.content_search.connect('search-changed', Lang.bind(this, function() {
            this.discovery_content.invalidate_filter();
        }));

        this.discovery_content.connect('child-activated', Lang.bind(this, function(box, child) {
            child.model.performAction({
                gameService: this.game_service
            });
        }));

        this.discovery_content.set_filter_func(Lang.bind(this, function(child) {
            let searchText = this.content_search.get_text();
            let tags = [...this._toggledTags];

            // Quick check - if we don't have any tags or a search term
            // we can just skip the check alltogether
            if (!tags.length && !searchText)
                return true;

            let model_child = child.model;
            let matches_tags = true;
            let matches_search = true;

            // If we have tags, then check to see if the model_child
            // matches any
            if (tags.length)
                matches_tags = model_child.matchesAnyOfProvidedTags(tags);

            if (searchText)
                matches_search = model_child.matchesSearchTerm(searchText);

            // XXX: Not sure if this should be an AND or OR operation
            // here (i.e do we expand or contract the list of results).
            return matches_tags && matches_search;
        }));
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
        if (!this._mainWindow) {
            let gameService = new Service.GameService({});
            this._mainWindow = new CodingDiscoveryCenterMainWindow({
                application: this,
                game_service: gameService,
                discovery_content_store: new DiscoveryContentStore({}, LessonContent)
            });
        }

        this._mainWindow.present();
    },
});


function main(argv) { // eslint-disable-line no-unused-vars
    return (new CodingDiscoveryCenterApplication()).run(argv);
}
