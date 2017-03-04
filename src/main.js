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

const _LessonContent = [
    {
        name: 'Terminal',
        subtitle: 'Dig into the system',
        tags: ['poweruser', 'code', 'os', 'terminal'],
        id: 'showmehow::terminal',
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
        id: 'chatbox::processing',
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
        id: 'chatbox::codeview',
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
        id: 'showmehow::python',
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
        id: 'chatbox::python::functions',
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
        id: 'chatbox::shell::extensions',
        action: {
            name: 'start-mission',
            data: {
                name: 'shellextension'
            }
        }
    }
];

// Takes a list with each object-value having some key idKey
// which uniquely identifies this element and then turns it into
// a map that can be used for O(1) access.
function _toFastLookupMap(list, idKey) {
    let map = {};
    list.forEach(function(element) {
        map[element[idKey]] = element;
    });
    return map;
}

const LessonContent = _toFastLookupMap(_LessonContent, 'id');

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

function warnUnableToStartLesson(reason) {
    let dialog = new Gtk.MessageDialog({
        text: 'Unable to start this lesson',
        secondary_text: reason,
        buttons: Gtk.ButtonsType.OK
    });
    dialog.connect('response', function() {
        dialog.destroy();
    });
    dialog.show();
}

function FailedToLaunchError(message) {
    this.name = 'FailedToLaunchError';
    this.message = message;
    return this;
}
FailedToLaunchError.prototype = Error.prototype;

const DiscoveryCenterServicesBundle = new Lang.Class({
    Name: 'DiscoveryCenterServicesBundle',
    Extends: GObject.Object,
    Properties: {
        game: GObject.ParamSpec.object('game',
                                       '',
                                       '',
                                       GObject.ParamFlags.READWRITE |
                                       GObject.ParamFlags.CONSTRUCT_ONLY,
                                       Service.GameService.$gtype)
    },

    _init: function(params) {
        this.parent(params);
    },

    startChatboxMission: function(name) {
        // Launch the chatbox app, and then fire the start-mission
        // event.
        let app = Gio.DesktopAppInfo.new('com.endlessm.Coding.Chatbox.desktop');
        if (app) {
            app.launch([], null);
            this.game.startMission(name);
            return;
        }

        throw new FailedToLaunchError('ChatBox is not installed. Install it from Software');
    }
});

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
        services.startChatboxMission(data.name);
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
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-content-item-view.ui',
    Children: [
        'background-content',
        'item-title',
        'item-subtitle'
    ],

    _init: function(params, action, tags) {
        params.width_request = 200;
        params.height_request = 200;

        this.parent(params);
        this.action = action;
        this.tags = tags;

        let colorIndex = Math.floor((Math.random() * 10) % AVAILABLE_COLORS.length);

        let contentBackgroundProvider = new Gtk.CssProvider();
        let contentBackgroundStyleContext = this.background_content.get_style_context();
        let [className, backgroundCss] = CSSAllocator({
            background_color: AVAILABLE_COLORS[colorIndex]
        });
        contentBackgroundProvider.load_from_data(backgroundCss);
        contentBackgroundStyleContext.add_class(className);
        contentBackgroundStyleContext.add_provider(contentBackgroundProvider,
                                      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

        this.item_title.label = this.model.title;
        this.item_subtitle.label = this.model.title;

        this.get_style_context().add_class('content-item');
    }
});

const DiscoveryContentFlowBox = new Lang.Class({
    Name: 'DiscoveryContentFlowBox',
    Extends: Gtk.FlowBox,
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-content-flow-box.ui',
    Properties: {
        store: GObject.ParamSpec.object('store',
                                        '',
                                        '',
                                        GObject.ParamFlags.READWRITE |
                                        GObject.ParamFlags.CONSTRUCT_ONLY,
                                        DiscoveryContentStore.$gtype)
    },

    _init: function(params) {
        params.activate_on_single_click = false;
        this.parent(params);

        // XXX: For some reason discovery_content.bind_model doesn't seem to
        // work. The callback gets invoked with null every time. Checked
        // the bindings and there doesn't seem to be anything wrong there
        // so either we are doing something wrong or there is a problem
        // deep within Gjs. In any event, we want to use the filter func
        // so we can't use bind_model anyway.
        //
        // For now we don't care about model updates, so just use forEach
        this.store.forEach(Lang.bind(this, function(item) {
            this.add(new DiscoveryContentItemView({
                visible: true,
                model: item
            }));
        }));

        this._filterCallback = null;

        this.set_filter_func(Lang.bind(this, function(child) {
            if (this._filterCallback) {
                return this._filterCallback(child);
            }

            return true;
        }));
    },

    refilter: function(filterCallback) {
        this._filterCallback = filterCallback;
        this.invalidate_filter();
    }
});

const DiscoveryContentRow = new Lang.Class({
    Name: 'DiscoveryContentRow',
    Extends: Gtk.Box,
    Properties: {
        'services': GObject.ParamSpec.object('services',
                                             '',
                                             '',
                                             GObject.ParamFlags.READWRITE |
                                             GObject.ParamFlags.CONSTRUCT_ONLY,
                                             DiscoveryCenterServicesBundle.$gtype),
        'title': GObject.ParamSpec.string('title',
                                          '',
                                          '',
                                          GObject.ParamFlags.READWRITE |
                                          GObject.ParamFlags.CONSTRUCT_ONLY,
                                          '')
    },
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-content-row.ui',
    Children: [
        'title-label',
        'content-box'
    ],

    _init: function(params, contentIds) {
        this.parent(params);

        let flowBox = new DiscoveryContentFlowBox({
            visible: true,
            store: new DiscoveryContentStore(
                {},
                Object.keys(LessonContent)
                      .filter(k => contentIds.indexOf(k) !== -1)
                      .map(k => LessonContent[k])
            )
        });

        flowBox.connect('child-activated', Lang.bind(this, function(box, child) {
            try {
                child.model.performAction(this.services);
            } catch (e) {
                if (e instanceof FailedToLaunchError) {
                    warnUnableToStartLesson(e.message);
                    return;
                }

                throw e;
            }
        }));

        this.title_label.label = this.title;
        this.content_box.add(flowBox);
    }
});


const DiscoveryCenterSearchState = new Lang.Class({
    Name: 'DiscoveryCenterSearchState',
    Extends: GObject.Object,
    Signals: {
        'updated': {}
    },
    Properties: {
        'active': GObject.ParamSpec.boolean('active',
                                            '',
                                            '',
                                            GObject.ParamFlags.READABLE,
                                            false)
    },

    get active() {
        return !!(this._toggledTags.size || this._searchText.length);
    },

    _init: function(params) {
        this.parent(params);
        this._toggledTags = Set();  // eslint-disable-line no-undef
        this._searchText = "";
    },

    addTag: function(tag) {
        this._toggledTags.add(tag.name);
        this.emit('updated');
    },

    removeTag: function(tag) {
        this._toggledTags.delete(tag.name);
        this.emit('updated');
    },

    updateSearchText: function(text) {
        this._searchText = text;
        this.emit('updated');
    },

    contentItemModelMatches: function(model) {
        let searchText = this._searchText;
        let tags = [...this._toggledTags];

        // Quick check - if we don't have any tags or a search term
        // we can just skip the check alltogether
        if (!tags.length && !searchText)
            return true;

        let matches_tags = true;
        let matches_search = true;

        // If we have tags, then check to see if the model_child
        // matches any
        if (tags.length)
            matches_tags = model.matchesAnyOfProvidedTags(tags);

        if (searchText)
            matches_search = model.matchesSearchTerm(searchText);

        // XXX: Not sure if this should be an AND or OR operation
        // here (i.e do we expand or contract the list of results).
        return matches_tags && matches_search;
    }

});

const DiscoveryCenterSearch = new Lang.Class({
    Name: 'DiscoveryCenterSearch',
    Extends: Gtk.Box,
    Properties: {
        'state': GObject.ParamSpec.object('state',
                                          '',
                                          '',
                                          GObject.ParamFlags.READWRITE |
                                          GObject.ParamFlags.CONSTRUCT_ONLY,
                                          DiscoveryCenterSearchState.$gtype)
    },
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-center-search.ui',
    Children: [
        'content-search',
        'tag-selection-bar'
    ],

    _init: function(params) {
        this.parent(params);

        Tags.forEach(Lang.bind(this, function(tag) {
            let button = new Gtk.ToggleButton({
                label: tag.title,
                visible: true,
                draw_indicator: true
            });

            button.connect('toggled', Lang.bind(this, function() {
                if (button.active) {
                    this.state.addTag(tag);
                } else {
                    this.state.removeTag(tag);
                }
            }));
            this.tag_selection_bar.add(button);
        }));

        this.content_search.connect('search-changed', Lang.bind(this, function() {
            this.state.updateSearchText(this.content_search.get_text());
        }));
    }
});


const DiscoveryCenterSearchResultsPage = new Lang.Class({
    Name: 'DiscoveryCenterSearchResultsPage',
    Extends: Gtk.Box,
    Properties: {
        services: GObject.ParamSpec.object('services',
                                           '',
                                           '',
                                           GObject.ParamFlags.READWRITE |
                                           GObject.ParamFlags.CONSTRUCT_ONLY,
                                           DiscoveryCenterServicesBundle.$gtype),
        search_state: GObject.ParamSpec.object('search-state',
                                               '',
                                               '',
                                               GObject.ParamFlags.READWRITE |
                                               GObject.ParamFlags.CONSTRUCT_ONLY,
                                               DiscoveryCenterSearchState.$gtype)
    },
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-center-search-results-page.ui',

    _init: function(params) {
        this.parent(params);

        // Include everything in the search results page, we'll filter it
        // by the contents of the search bar
        this._model = new DiscoveryContentStore(
            {}, Object.keys(LessonContent).map(k => LessonContent[k])
        );

        this._flowBox = new DiscoveryContentFlowBox({
            visible: true,
            store: this._model
        });
        this.add(this._flowBox);

        this.search_state.connect('updated', Lang.bind(this, function() {
            this._flowBox.refilter(Lang.bind(this, function(child) {
                return this.search_state.contentItemModelMatches(child.model);
            }));
        }));

        this._flowBox.connect('child-activated', Lang.bind(this, function(box, child) {
            child.model.performAction(this.services);
        }));
    }
});

const HOME_PAGE_CONTENT = {
    "rows": [
        {
            "title": "Tutorials",
            "children": [
                "showmehow::terminal",
                "chatbox::processing",
                "showmehow::python"
            ]
        },
        {
            "title": "Examples",
            "children": [
                "chatbox::python::functions",
                "chatbox::shell::extensions"
            ]
        },
        {
            "title": "Templates",
            "children": [
                "chatbox::codeview"
            ]
        }
    ]
};

const DiscoveryCenterHomePage = new Lang.Class({
    Name: 'DiscoveryCenterHomePage',
    Extends: Gtk.Box,
    Properties: {
        services: GObject.ParamSpec.object('services',
                                           '',
                                           '',
                                           GObject.ParamFlags.READWRITE |
                                           GObject.ParamFlags.CONSTRUCT_ONLY,
                                           DiscoveryCenterServicesBundle.$gtype)
    },
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-center-home-page.ui',
    Children: [
        'rows'
    ],

    _init: function(params) {
        this.parent(params);

        HOME_PAGE_CONTENT.rows.forEach(Lang.bind(this, function(row) {
            let contentRow = new DiscoveryContentRow({
                services: this.services,
                title: row.title
            }, row.children);

            this.rows.add(contentRow);
        }));
    }
});

const CodingDiscoveryCenterMainWindow = new Lang.Class({
    Name: 'CodingDiscoveryCenterMainWindow',
    Extends: Gtk.ApplicationWindow,
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/main.ui',
    Children: [
        'content-views',
        'content-search-box',
        'search-results-box',
        'home-page-box'
    ],
    Properties: {
        services: GObject.ParamSpec.object('services',
                                           '',
                                           '',
                                           GObject.ParamFlags.READWRITE |
                                           GObject.ParamFlags.CONSTRUCT_ONLY,
                                           DiscoveryCenterServicesBundle.$gtype)
    },

    _init: function(params) {
        this.parent(params);

        let header = new Gtk.HeaderBar({
            visible: true,
            title: GLib.get_application_name(),
            show_close_button: true
        });
        this.set_titlebar(header);

        let searchState = new DiscoveryCenterSearchState({});
        let searchBar = new DiscoveryCenterSearch({
            visible: true,
            state: searchState
        });

        // Currently the way this works is that we show the search screen
        // unless we have no currently active search term, at which point
        // we go back to the home page.
        //
        // Perhaps in a future iteration we could have a more explicit
        // interaction here.
        searchState.connect('updated', Lang.bind(this, function() {
            if (searchState.active) {
                this.content_views.set_visible_child_name('search');
            } else {
                this.content_views.set_visible_child_name('home');
            }
        }));

        this.content_search_box.add(searchBar);
        this.search_results_box.add(new DiscoveryCenterSearchResultsPage({
            visible: true,
            search_state: searchState,
            services: this.services
        }));
        this.home_page_box.add(new DiscoveryCenterHomePage({
            visible: true,
            services: this.services
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
            let servicesBundle = new DiscoveryCenterServicesBundle({
                game: new Service.GameService({})
            });
            this._mainWindow = new CodingDiscoveryCenterMainWindow({
                application: this,
                services: servicesBundle
            });
        }

        this._mainWindow.present();
    },
});


function main(argv) { // eslint-disable-line no-unused-vars
    return (new CodingDiscoveryCenterApplication()).run(argv);
}
