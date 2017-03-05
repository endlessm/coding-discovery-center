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
const Mainloop = imports.mainloop;

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
    },
    {
        name: 'Python',
        subtitle: 'The Python Programming Language',
        tags: ['shell', 'code', 'os'],
        id: 'category::python',
        action: {
            name: 'switch-category',
            data: {
                name: 'python'
            }
        }
    },
    {
        name: 'Endless OS',
        subtitle: 'Endless OS',
        tags: ['code', 'os'],
        id: 'category::eos',
        action: {
            name: 'switch-category',
            data: {
                name: 'eos'
            }
        }
    },
    {
        name: 'GNOME',
        subtitle: 'The GNOME Platform',
        tags: ['code', 'gnome'],
        id: 'category::gnome',
        action: {
            name: 'switch-category',
            data: {
                name: 'gnome'
            }
        }
    },
    {
        name: 'GTK+ FAQ',
        subtitle: 'FAQs for GTK+',
        tags: ['code', 'gnome'],
        id: 'web::gtk_faq',
        action: {
            name: 'open-url',
            data: {
                name: 'https://developer.gnome.org/gtk3/stable/gtk-question-index.html'
            }
        }
    },
    {
        name: 'GNotification',
        subtitle: 'Sending notifications using the GNOME platform',
        tags: ['code', 'gnome'],
        id: 'web::gnonitifcation_howdi',
        action: {
            name: 'open-url',
            data: {
                name: 'https://developer.gnome.org/GNotification/'
            }
        }
    }
];

const _Categories = [
    {
        name: 'None',
        subtitle: 'If you see this page, it is an error',
        tags: [],
        id: 'none',
        rows: []
    },
    {
        name: 'Python',
        subtitle: 'The Python Programming Language',
        tags: ['python'],
        id: 'python',
        rows: [
            {
                title: 'Python Basics',
                children: [
                    'showmehow::python',
                    'chatbox::python::functions'
                ]
            }
        ]
    },
    {
        name: 'Endless OS',
        subtitle: 'Everything about Endless OS',
        id: 'eos',
        tags: ['os'],
        rows: [
            {
                title: 'Make things with Code',
                children: [
                    'chatbox::codeview'
                ]
            }
        ]
    },
    {
        name: 'GNOME',
        subtitle: 'The GNOME Platform',
        id: 'gnome',
        tags: ['code'],
        rows: [
            {
                title: 'GNOME Core',
                children: [
                    'showmehow::terminal'
                ]
            }
        ]
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
const Categories = _toFastLookupMap(_Categories, 'id');

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

function findLessonContentEntriesFor(contentIds) {
    return Object.keys(LessonContent)
                 .filter(k => contentIds.indexOf(k) !== -1)
                 .map(k => LessonContent[k]);
}

const DiscoveryCenterServicesBundle = new Lang.Class({
    Name: 'DiscoveryCenterServicesBundle',
    Extends: GObject.Object,
    Properties: {
        game: GObject.ParamSpec.object('game',
                                       '',
                                       '',
                                       GObject.ParamFlags.READWRITE |
                                       GObject.ParamFlags.CONSTRUCT_ONLY,
                                       Service.GameService.$gtype),
        application: GObject.ParamSpec.object('application',
                                              '',
                                              '',
                                              GObject.ParamFlags.READWRITE |
                                              GObject.ParamFlags.CONSTRUCT_ONLY,
                                              Gio.Application)
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
    },

    switchCategory: function(name) {
        // Switch the currently active category on the app.
        this.application.activate_action('switch-category',
                                         GLib.Variant.new('s', name));
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
    },
    'switch-category': function(services, data) {
        services.switchCategory(data.name);
    }
};

const DiscoveryContentItem = new Lang.Class({
    Name: 'DiscoveryContentItem',
    Extends: GObject.Object,
    Properties: {
        id: GObject.ParamSpec.string('id',
                                     '',
                                     '',
                                     GObject.ParamFlags.READWRITE |
                                     GObject.ParamFlags.CONSTRUCT_ONLY,
                                     ''),
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
            return tag.toLowerCase().indexOf(lowerSearchTerm) !== -1;
        }));
        let nameMatchesSearchTerm = (
            this.title.toLowerCase().indexOf(lowerSearchTerm) !== -1
        );
        let subtitleMatchesSearchTerm = (
            this.subtitle.toLowerCase().indexOf(lowerSearchTerm) !== -1
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
                id: item.id,
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
    }
});

const DiscoveryContentCarouselItem = new Lang.Class({
    Name: 'DiscoveryContentCarouselItem',
    Extends: Gtk.Button,
    Properties: {
        model: GObject.ParamSpec.object('model',
                                        '',
                                        '',
                                        GObject.ParamFlags.READWRITE |
                                        GObject.ParamFlags.CONSTRUCT_ONLY,
                                        DiscoveryContentItem.$gtype)
    },
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-content-carousel-item.ui',
    Children: [
        'background-content',
        'item-title',
        'item-subtitle'
    ],

    _init: function(params) {
        this.parent(params);

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
    }
});

const DiscoveryContentCarousel = new Lang.Class({
    Name: 'DiscoveryContentCarousel',
    Extends: Gtk.Stack,
    Properties: {
        store: GObject.ParamSpec.object('store',
                                        '',
                                        '',
                                        GObject.ParamFlags.READWRITE |
                                        GObject.ParamFlags.CONSTRUCT_ONLY,
                                        DiscoveryContentStore.$gtype)
    },
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-content-carousel.ui',
    Signals: {
        'activate-item': {
            param_types: [ GObject.TYPE_OBJECT ]
        }
    },

    _init: function(params) {
        this.parent(params);

        this.store.forEach(Lang.bind(this, function(item) {
            let view = new DiscoveryContentCarouselItem({
                visible: true,
                model: item
            });
            view.connect('clicked', Lang.bind(this, function() {
                this.emit('activate-item', item);
            }));

            this.add_named(view, item.id);
        }));

        this._activeCarouselIndex = 0;
    },

    nextItem: function() {
        if (this.store.get_n_items() === 0)
            return;

        this._activeCarouselIndex = ((this._activeCarouselIndex + 1) %
                                     this.store.get_n_items());
        let model = this.store.get_item(this._activeCarouselIndex);
        this.set_visible_child_name(model.id);
    },

    prevItem: function() {
        if (this.store.get_n_items() === 0)
            return;

        this._activeCarouselIndex = ((this._activeCarouselIndex - 1) %
                                     this.store.get_n_items());
        let model = this.store.get_item(this._activeCarouselIndex);
        this.set_visible_child_name(model.id);
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
    Signals: {
        'activate-item': {
            param_types: [ GObject.TYPE_OBJECT ]
        }
    },

    _init: function(params, contentIds) {
        this.parent(params);

        let flowBox = new DiscoveryContentFlowBox({
            visible: true,
            store: new DiscoveryContentStore(
                {},
                findLessonContentEntriesFor(contentIds)
            )
        });

        flowBox.connect('child-activated', Lang.bind(this, function(box, child) {
            this.emit('activate-item', child.model);
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
        this._searchText = '';
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
        search_state: GObject.ParamSpec.object('search-state',
                                               '',
                                               '',
                                               GObject.ParamFlags.READWRITE |
                                               GObject.ParamFlags.CONSTRUCT_ONLY,
                                               DiscoveryCenterSearchState.$gtype)
    },
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-center-search-results-page.ui',
    Signals: {
        'activate-item': {
            param_types: [ GObject.TYPE_OBJECT ]
        }
    },

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
            this.emit('activate-item', child.model);
        }));
    }
});

const HOME_PAGE_CONTENT = {
    'carousel': [
        'showmehow::terminal',
        'category::gnome',
        'chatbox::python::functions'
    ],
    'rows': [
        {
            'title': 'Categories',
            'children': [
                'category::gnome',
                'category::eos',
                'category::python'
            ]
        },
        {
            'title': 'Tutorials',
            'children': [
                'showmehow::terminal',
                'chatbox::processing',
                'showmehow::python'
            ]
        },
        {
            'title': 'Examples',
            'children': [
                'chatbox::python::functions',
                'chatbox::shell::extensions'
            ]
        },
        {
            'title': 'Templates',
            'children': [
                'chatbox::codeview'
            ]
        }
    ]
};

const SWITCH_CONTENT_TIME = 10;

const DiscoveryCenterCategoryPage = new Lang.Class({
    Name: 'DiscoveryCenterCategoryPage',
    Extends: Gtk.Box,
    Properties: {
        category: GObject.ParamSpec.string('category',
                                           '',
                                           '',
                                           GObject.ParamFlags.READABLE,
                                           'none')
    },
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-center-category-page.ui',
    Children: [
        'rows'
    ],
    Signals: {
        'activate-item': {
            param_types: [ GObject.TYPE_OBJECT ]
        }
    },

    get category() {
        return this._category;
    },

    _init: function(params) {
        this.parent(params);
        this.changeCategory('none');
    },

    changeCategory: function(category) {
        if (Object.keys(Categories).indexOf(category) === -1) {
            throw new Error('Category ' + category + ' does not exist');
        }

        this._category = category;

        // First, drop all the existing content
        this.rows.get_children().forEach(function(child) {
            child.destroy();
        });

        // Now go through all the rows in this category and add
        // them again.
        let categoryContent = Categories[this._category];
        categoryContent.rows.forEach(Lang.bind(this, function(row) {
            let contentRow = new DiscoveryContentRow({
                title: row.title
            }, row.children);
            contentRow.connect('activate-item', Lang.bind(this, function(row, item) {
                this.emit('activate-item', item);
            }));

            this.rows.add(contentRow);
        }));
    }
});

const DiscoveryCenterHomePage = new Lang.Class({
    Name: 'DiscoveryCenterHomePage',
    Extends: Gtk.Box,
    Template: 'resource:///com/endlessm/Coding/DiscoveryCenter/discovery-center-home-page.ui',
    Children: [
        'carousel-box',
        'rows'
    ],
    Signals: {
        'activate-item': {
            param_types: [ GObject.TYPE_OBJECT ]
        }
    },

    _init: function(params) {
        this.parent(params);

        let carousel = new DiscoveryContentCarousel({
            store: new DiscoveryContentStore(
                {},
                findLessonContentEntriesFor(HOME_PAGE_CONTENT.carousel)
            ),
            visible: true,
            vexpand: true,
            valign: Gtk.Align.FILL
        });
        this.carousel_box.add(carousel);

        HOME_PAGE_CONTENT.rows.forEach(Lang.bind(this, function(row) {
            let contentRow = new DiscoveryContentRow({
                title: row.title
            }, row.children);
            contentRow.connect('activate-item', Lang.bind(this, function(row, item) {
                this.emit('activate-item', item);
            }));

            this.rows.add(contentRow);
        }));

        Mainloop.timeout_add_seconds(SWITCH_CONTENT_TIME, Lang.bind(this, function() {
            carousel.nextItem();
            return true;
        }));

        carousel.connect('activate-item', Lang.bind(this, function(carousel, item) {
            this.emit('activate-item', item);
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
        'category-box',
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

        // Add a 'switch-category' action to the application
        // which we will connect to and use to switch categories.
        let switchCategoryAction = new Gio.SimpleAction({
            name: 'switch-category',
            parameter_type: new GLib.VariantType('s')
        });
        switchCategoryAction.connect('activate', Lang.bind(this, function(action, parameter) {
            let page = this.content_views.get_child_by_name('category').get_children()[0];
            page.changeCategory(parameter.unpack());
            this.content_views.set_visible_child_name('category');
        }));
        this.application.add_action(switchCategoryAction);

        this.content_search_box.add(searchBar);
        let homePage = new DiscoveryCenterHomePage({
            visible: true
        });
        let searchPage = new DiscoveryCenterSearchResultsPage({
            visible: true,
            search_state: searchState
        });
        let categoryPage = new DiscoveryCenterCategoryPage({
            visible: true
        });

        homePage.connect('activate-item', Lang.bind(this, this._activateItem));
        searchPage.connect('activate-item', Lang.bind(this, this._activateItem));
        categoryPage.connect('activate-item', Lang.bind(this, this._activateItem));

        this.search_results_box.add(searchPage);
        this.home_page_box.add(homePage);
        this.category_box.add(categoryPage);
    },

    _activateItem: function(object, item) {
        try {
            item.performAction(this.services);
        } catch (e) {
            if (e instanceof FailedToLaunchError) {
                warnUnableToStartLesson(e.message);
                return;
            }

            throw e;
        }
    }
});


const CodingDiscoveryCenterApplication = new Lang.Class({
    Name: 'CodingDiscoveryCenterApplication',
    Extends: Gtk.Application,

    _init: function() {
        this._mainWindow = null;

        this.parent({ application_id: pkg.name });
        GLib.set_application_name(_('Coding Discovery Center'));
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
                game: new Service.GameService({}),
                application: this
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
