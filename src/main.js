/* global pkg, _ */
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
    GObject: '2.0',
});

const {Gdk, GObject, Gio, GLib, Gtk} = imports.gi;

const Service = imports.service;

const RESOURCE_PATH = 'resource:///com/endlessm/Coding/DiscoveryCenter/';

const _LessonContent = [
    {
        name: 'Terminal',
        subtitle: 'Dig into the system',
        tags: ['poweruser', 'code', 'os', 'terminal'],
        id: 'showmehow::terminal',
        action: {
            name: 'start-mission',
            data: {
                name: 'terminalintro',
            },
        },
    },
    {
        name: 'Processing',
        subtitle: 'Code can be beautiful',
        tags: ['visual', 'code', 'processing'],
        id: 'chatbox::processing',
        action: {
            name: 'start-mission',
            data: {
                name: 'processing',
            },
        },
    },
    {
        name: 'CodeView',
        subtitle: 'Sneak behind the screen',
        tags: ['javascript', 'code', 'os'],
        id: 'chatbox::codeview',
        action: {
            name: 'start-mission',
            data: {
                name: 'weather',
            },
        },
    },
    {
        name: 'Python Console',
        subtitle: 'Use Python in the Terminal',
        tags: ['python', 'code', 'os', 'terminal'],
        id: 'showmehow::python',
        action: {
            name: 'start-mission',
            data: {
                name: 'python',
            },
        },
    },
    {
        name: 'Python Functions',
        subtitle: 'Write some functions and classes with Python',
        tags: ['python', 'code', 'editor'],
        id: 'chatbox::python::functions',
        action: {
            name: 'start-mission',
            data: {
                name: 'python_functions',
            },
        },
    },
    {
        name: 'Shell extensions',
        subtitle: 'Customise your OS',
        tags: ['shell', 'code', 'os'],
        id: 'chatbox::shell::extensions',
        action: {
            name: 'start-mission',
            data: {
                name: 'shellextension',
            },
        },
    },
    {
        name: 'Python',
        subtitle: 'The Python Programming Language',
        tags: ['shell', 'code', 'os'],
        id: 'category::python',
        action: {
            name: 'switch-category',
            data: {
                name: 'python',
            },
        },
    },
    {
        name: 'Endless OS',
        subtitle: 'Endless OS',
        tags: ['code', 'os'],
        id: 'category::eos',
        action: {
            name: 'switch-category',
            data: {
                name: 'eos',
            },
        },
    },
    {
        name: 'GNOME',
        subtitle: 'The GNOME Platform',
        tags: ['code', 'gnome'],
        id: 'category::gnome',
        action: {
            name: 'switch-category',
            data: {
                name: 'gnome',
            },
        },
    },
    {
        name: 'GTK+ FAQ',
        subtitle: 'FAQs for GTK+',
        tags: ['code', 'gnome'],
        id: 'web::gtk_faq',
        action: {
            name: 'open-uri',
            data: {
                uri: 'https://developer.gnome.org/gtk3/stable/gtk-question-index.html',
            },
        },
    },
    {
        name: 'GNotification',
        subtitle: 'Sending notifications using the GNOME platform',
        tags: ['code', 'gnome'],
        id: 'web::gnonitifcation_howdi',
        action: {
            name: 'open-uri',
            data: {
                uri: 'https://developer.gnome.org/GNotification/',
            },
        },
    },
];

const _Categories = [
    {
        name: 'None',
        subtitle: 'If you see this page, it is an error',
        tags: [],
        id: 'none',
        rows: [],
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
                    'chatbox::python::functions',
                ],
            },
        ],
    },
    {
        name: 'Endless OS',
        subtitle: 'Everything about Endless OS',
        id: 'eos',
        tags: ['os'],
        rows: [
            {
                title: 'Make things with Code',
                children: ['chatbox::codeview'],
            },
        ],
    },
    {
        name: 'GNOME',
        subtitle: 'The GNOME Platform',
        id: 'gnome',
        tags: ['code'],
        rows: [
            {
                title: 'GNOME Core',
                children: ['showmehow::terminal'],
            },
        ],
    },
];

// Takes a list with each object-value having some key idKey
// which uniquely identifies this element and then turns it into
// a map that can be used for O(1) access.
function _toFastLookupMap(list, idKey) {
    const map = {};
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
        name: 'shell',
    },
    {
        title: 'Code',
        name: 'code',
    },
    {
        title: 'Operating System',
        name: 'os',
    },
    {
        title: 'Editor',
        name: 'editor',
    },
    {
        title: 'Processing',
        name: 'processing',
    },
    {
        title: 'Python',
        name: 'python',
    },
    {
        title: 'Visual',
        name: 'visual',
    },
    {
        title: 'JavaScript',
        name: 'javascript',
    },
];

function warnUnableToStartLesson(reason) {
    const dialog = new Gtk.MessageDialog({
        text: 'Unable to start this lesson',
        secondary_text: reason,
        buttons: Gtk.ButtonsType.OK,
    });
    dialog.connect('response', function() {
        dialog.destroy();
    });
    dialog.show();
}

class FailedToLaunchError extends Error {
    constructor(message) {
        super();
        this.name = 'FailedToLaunchError';
        this.message = message;
    }
}

function findLessonContentEntriesFor(contentIds) {
    return Object.keys(LessonContent)
        .filter(k => contentIds.includes(k))
        .map(k => LessonContent[k]);
}

const DiscoveryCenterServicesBundle = GObject.registerClass({
    Properties: {
        game: GObject.ParamSpec.object('game', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            Service.GameService.$gtype),
        application: GObject.ParamSpec.object('application', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            Gio.Application),
    },
}, class DiscoveryCenterServicesBundle extends GObject.Object {
    startChatboxMission(name) {
        // Launch the chatbox app, and then fire the start-mission
        // event.
        const app = Gio.DesktopAppInfo.new('com.endlessm.Coding.Chatbox.desktop');
        if (app) {
            app.launch([], null);
            this.game.startMission(name);
            return;
        }

        throw new FailedToLaunchError('ChatBox is not installed. Install it from Software');
    }

    switchCategory(name) {
        // Switch the currently active category on the app.
        this.application.activate_action('switch-category',
            GLib.Variant.new('s', name));
    }
});

function load_style_sheet(resourcePath) {
    const provider = new Gtk.CssProvider();
    provider.load_from_resource(resourcePath);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
        provider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

// Each of these action dispatchers is always passed an object called 'services'
// which contains a mapping of any relevant services (for instance gameService)
// and data, which is per-action defined.
const _ACTION_DISPATCH = {
    'start-mission'(services, data) {
        services.startChatboxMission(data.name);
    },
    'switch-category'(services, data) {
        services.switchCategory(data.name);
    },
    'open-uri'(services, data) {
        const path = Gio.File.new_for_uri(data.uri);
        path.query_default_handler(null).launch([path], null);
    },
};

const DiscoveryContentItem = GObject.registerClass({
    Properties: {
        id: GObject.ParamSpec.string('id', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
        title: GObject.ParamSpec.string('title', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
        subtitle: GObject.ParamSpec.string('subtitle', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
    },
}, class DiscoveryContentItem extends GObject.Object {
    _init(params, action, tags) {
        super._init(params);

        this._action = action;
        this._tags = tags;
    }

    performAction(services) {
        return _ACTION_DISPATCH[this._action.name](services, this._action.data);
    }

    matchesAnyOfProvidedTags(tags) {
        return tags.some(tag => this._tags.includes(tag));
    }

    matchesSearchTerm(searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const tagMatchesSearchTerm = this._tags.some(tag =>
            tag.toLowerCase().indexOf(lowerSearchTerm) !== -1);
        const nameMatchesSearchTerm =
            this.title.toLowerCase().indexOf(lowerSearchTerm) !== -1;
        const subtitleMatchesSearchTerm =
            this.subtitle.toLowerCase().indexOf(lowerSearchTerm) !== -1;
        return tagMatchesSearchTerm ||
                nameMatchesSearchTerm ||
                subtitleMatchesSearchTerm;
    }
});

const DiscoveryContentStore = GObject.registerClass(class extends Gio.ListStore {
    _init(params, contentItems) {
        params.item_type = DiscoveryContentItem.$gtype;

        super._init(params);

        contentItems.forEach(({id, name, subtitle, action, tags}) => {
            this.append(new DiscoveryContentItem({
                id,
                title: name,
                subtitle,
            }, action, tags));
        });
    }

    forEach(callback) {
        for (let i = 0; i < this.get_n_items(); ++i)
            callback(this.get_item(i));
    }
});

const CSSAllocator = (function() {
    let counter = 0;
    return function(properties) {
        const class_name = `themed-widget-${counter++}`;
        const rules = Object.keys(properties)
            .map(key => `${key.replace('_', '-')}: ${properties[key]};`)
            .join(' ');
        return [class_name, `.${class_name} { ${rules} }`];
    };
}());

const AVAILABLE_COLORS = ['black', 'blue', 'green', 'purple', 'orange'];

const DiscoveryContentItemView = GObject.registerClass({
    Properties: {
        model: GObject.ParamSpec.object('model',
            '',
            '',
            GObject.ParamFlags.READWRITE |
                                        GObject.ParamFlags.CONSTRUCT_ONLY,
            DiscoveryContentItem.$gtype),
    },
    Template: `${RESOURCE_PATH}discovery-content-item-view.ui`,
    Children: [
        'background-content',
        'item-title',
        'item-subtitle',
    ],
}, class DiscoveryContentItemView extends Gtk.Box {
    _init(params) {
        super._init(params);

        const colorIndex = Math.floor(Math.random() * 10 % AVAILABLE_COLORS.length);

        const contentBackgroundProvider = new Gtk.CssProvider();
        const contentBackgroundStyleContext = this.background_content.get_style_context();
        const [className, backgroundCss] = CSSAllocator({
            background_color: AVAILABLE_COLORS[colorIndex],
        });
        contentBackgroundProvider.load_from_data(backgroundCss);
        contentBackgroundStyleContext.add_class(className);
        contentBackgroundStyleContext.add_provider(contentBackgroundProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

        this.item_title.label = this.model.title;
        this.item_subtitle.label = this.model.title;
    }
});

const DiscoveryContentFlowBoxChildItem = GObject.registerClass({
    Template: `${RESOURCE_PATH}discovery-content-flow-box-child-item.ui`,
}, class DiscoveryContentFlowBoxChildItem extends Gtk.FlowBoxChild {
});

const DiscoveryContentCarousel = GObject.registerClass({
    Properties: {
        store: GObject.ParamSpec.object('store',
            '',
            '',
            GObject.ParamFlags.READWRITE |
                                        GObject.ParamFlags.CONSTRUCT_ONLY,
            DiscoveryContentStore.$gtype),
    },
    Template: `${RESOURCE_PATH}discovery-content-carousel.ui`,
    Children: ['content-stack'],
    Signals: {
        'activate-item': {
            param_types: [GObject.TYPE_OBJECT],
        },
    },
}, class DiscoveryContentCarousel extends Gtk.Button {
    _init(params) {
        super._init(params);

        this.store.forEach(item => {
            const view = new DiscoveryContentItemView({
                visible: true,
                model: item,
            });

            // Make some slight display-related tweaks to the item view
            view.item_title.halign = Gtk.Align.END;
            view.item_subtitle.halign = Gtk.Align.END;
            view.get_style_context().add_class('carousel-item');
            this.content_stack.add_named(view, item.id);
        });

        this._activeCarouselIndex = 0;

        this.connect('clicked', () => {
            this.emit('activate-item',
                this.store.get_item(this._activeCarouselIndex));
        });
    }

    nextItem() {
        if (this.store.get_n_items() === 0)
            return;

        this._activeCarouselIndex = (this._activeCarouselIndex + 1) %
                                     this.store.get_n_items();
        const model = this.store.get_item(this._activeCarouselIndex);
        this.content_stack.set_visible_child_name(model.id);
    }

    prevItem() {
        if (this.store.get_n_items() === 0)
            return;

        this._activeCarouselIndex = (this._activeCarouselIndex - 1) %
                                     this.store.get_n_items();
        const model = this.store.get_item(this._activeCarouselIndex);
        this.content_stack.set_visible_child_name(model.id);
    }
});

const DiscoveryContentFlowBox = GObject.registerClass({
    Template: `${RESOURCE_PATH}discovery-content-flow-box.ui`,
    Properties: {
        store: GObject.ParamSpec.object('store', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            DiscoveryContentStore.$gtype),
    },
}, class DiscoveryContentFlowBox extends Gtk.FlowBox {
    _init(params) {
        params.activate_on_single_click = false;
        super._init(params);

        // XXX: For some reason discovery_content.bind_model doesn't seem to
        // work. The callback gets invoked with null every time. Checked
        // the bindings and there doesn't seem to be anything wrong there
        // so either we are doing something wrong or there is a problem
        // deep within Gjs. In any event, we want to use the filter func
        // so we can't use bind_model anyway.
        //
        // For now we don't care about model updates, so just use forEach
        this.store.forEach(item => {
            const child = new DiscoveryContentFlowBoxChildItem({
                visible: true,
            });
            child.add(new DiscoveryContentItemView({
                visible: true,
                model: item,
            }));
            this.add(child);
        });

        this._filterCallback = null;

        this.set_filter_func(child => {
            if (this._filterCallback)
                return this._filterCallback(child);
            return true;
        });
    }

    refilter(filterCallback) {
        this._filterCallback = filterCallback;
        this.invalidate_filter();
    }
});

const DiscoveryContentRow = GObject.registerClass({
    Properties: {
        title: GObject.ParamSpec.string('title', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
    },
    Template: `${RESOURCE_PATH}discovery-content-row.ui`,
    Children: [
        'title-label',
        'content-box',
    ],
    Signals: {
        'activate-item': {
            param_types: [GObject.TYPE_OBJECT],
        },
    },
}, class DiscoveryContentRow extends Gtk.Box {
    _init(params, contentIds) {
        super._init(params);

        const flowBox = new DiscoveryContentFlowBox({
            visible: true,
            store: new DiscoveryContentStore({},
                findLessonContentEntriesFor(contentIds)),
        });

        flowBox.connect('child-activated', (box, child) => {
            const [{model}] = child.get_children();
            this.emit('activate-item', model);
        });

        this.title_label.label = this.title;
        this.content_box.add(flowBox);
    }
});


const DiscoveryCenterSearchState = GObject.registerClass({
    Signals: {
        updated: {},
    },
    Properties: {
        active: GObject.ParamSpec.boolean('active', '', '',
            GObject.ParamFlags.READABLE, false),
    },
}, class DiscoveryCenterSearchState extends GObject.Object {
    get active() {
        return !!(this._toggledTags.size || this._searchText.length);
    }

    _init(params) {
        super._init(params);
        this._toggledTags = new Set();
        this._searchText = '';
    }

    addTag(tag) {
        this._toggledTags.add(tag.name);
        this.emit('updated');
    }

    removeTag(tag) {
        this._toggledTags.delete(tag.name);
        this.emit('updated');
    }

    updateSearchText(text) {
        this._searchText = text;
        this.emit('updated');
    }

    contentItemModelMatches(model) {
        const searchText = this._searchText;
        const tags = [...this._toggledTags];

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

const DiscoveryCenterSearch = GObject.registerClass({
    Properties: {
        state: GObject.ParamSpec.object('state', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            DiscoveryCenterSearchState.$gtype),
    },
    Template: `${RESOURCE_PATH}discovery-center-search.ui`,
    Children: [
        'content-search',
        'tag-selection-bar',
    ],
}, class DiscoveryCenterSearch extends Gtk.Box {
    _init(params) {
        super._init(params);

        Tags.forEach(tag => {
            const button = new Gtk.ToggleButton({
                label: tag.title,
                visible: true,
                draw_indicator: true,
            });

            button.connect('toggled', () => {
                if (button.active)
                    this.state.addTag(tag);
                else
                    this.state.removeTag(tag);
            });
            this.tag_selection_bar.add(button);
        });

        this.content_search.connect('search-changed', () => {
            this.state.updateSearchText(this.content_search.get_text());
        });
    }
});


const DiscoveryCenterSearchResultsPage = GObject.registerClass({
    Properties: {
        search_state: GObject.ParamSpec.object('search-state', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            DiscoveryCenterSearchState.$gtype),
    },
    Template: `${RESOURCE_PATH}discovery-center-search-results-page.ui`,
    Signals: {
        'activate-item': {
            param_types: [GObject.TYPE_OBJECT],
        },
    },
}, class DiscoveryCenterSearchResultsPage extends Gtk.Box {
    _init(params) {
        super._init(params);

        // Include everything in the search results page, we'll filter it
        // by the contents of the search bar
        this._model = new DiscoveryContentStore(
            {}, Object.keys(LessonContent).map(k => LessonContent[k])
        );

        this._flowBox = new DiscoveryContentFlowBox({
            visible: true,
            store: this._model,
        });
        this.add(this._flowBox);

        this.search_state.connect('updated', () => {
            this._flowBox.refilter(child => {
                const [{model}] = child.get_children();
                return this.search_state.contentItemModelMatches(model);
            });
        });

        this._flowBox.connect('child-activated', (box, child) => {
            const [{model}] = child.get_children();
            this.emit('activate-item', model);
        });
    }
});

const HOME_PAGE_CONTENT = {
    carousel: [
        'showmehow::terminal',
        'category::gnome',
        'chatbox::python::functions',
    ],
    rows: [
        {
            title: 'Categories',
            children: [
                'category::gnome',
                'category::eos',
                'category::python',
            ],
        },
        {
            title: 'Tutorials',
            children: [
                'showmehow::terminal',
                'chatbox::processing',
                'showmehow::python',
            ],
        },
        {
            title: 'Examples',
            children: [
                'chatbox::python::functions',
                'chatbox::shell::extensions',
            ],
        },
        {
            title: 'Templates',
            children: ['chatbox::codeview'],
        },
    ],
};

const SWITCH_CONTENT_TIME = 10;

const DiscoveryCenterCategoryPage = GObject.registerClass({
    Properties: {
        category: GObject.ParamSpec.string('category', '', '',
            GObject.ParamFlags.READABLE, 'none'),
    },
    Template: `${RESOURCE_PATH}discovery-center-category-page.ui`,
    Children: ['rows'],
    Signals: {
        'activate-item': {
            param_types: [GObject.TYPE_OBJECT],
        },
    },
}, class DiscoveryCenterCategoryPage extends Gtk.Box {
    get category() {
        return this._category;
    }

    _init(params) {
        super._init(params);
        this.changeCategory('none');
    }

    changeCategory(category) {
        if (!Object.keys(Categories).includes(category))
            throw new Error(`Category ${category} does not exist`);

        this._category = category;

        // First, drop all the existing content
        this.rows.get_children().forEach(function(child) {
            child.destroy();
        });

        // Now go through all the rows in this category and add
        // them again.
        const categoryContent = Categories[this._category];
        categoryContent.rows.forEach(({title, children}) => {
            const contentRow = new DiscoveryContentRow({title}, children);
            contentRow.connect('activate-item', (row, item) => {
                this.emit('activate-item', item);
            });

            this.rows.add(contentRow);
        });
    }
});

const DiscoveryCenterHomePage = GObject.registerClass({
    Template: `${RESOURCE_PATH}discovery-center-home-page.ui`,
    Children: [
        'carousel-box',
        'rows',
    ],
    Signals: {
        'activate-item': {
            param_types: [GObject.TYPE_OBJECT],
        },
    },
}, class DiscoveryCenterHomePage extends Gtk.Box {
    _init(params) {
        super._init(params);

        const carousel = new DiscoveryContentCarousel({
            store: new DiscoveryContentStore(
                {},
                findLessonContentEntriesFor(HOME_PAGE_CONTENT.carousel)
            ),
            visible: true,
            vexpand: true,
            valign: Gtk.Align.FILL,
        });
        this.carousel_box.add(carousel);

        HOME_PAGE_CONTENT.rows.forEach(({title, children}) => {
            const contentRow = new DiscoveryContentRow({title}, children);
            contentRow.connect('activate-item', (row, item) => {
                this.emit('activate-item', item);
            });

            this.rows.add(contentRow);
        });

        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, SWITCH_CONTENT_TIME, () => {
            carousel.nextItem();
            return GLib.SOURCE_CONTINUE;
        });

        carousel.connect('activate-item', (self, item) => {
            this.emit('activate-item', item);
        });
    }
});

const CodingDiscoveryCenterMainWindow = GObject.registerClass({
    Template: `${RESOURCE_PATH}main.ui`,
    Children: [
        'content-views',
        'content-search-box',
        'search-results-box',
        'category-box',
        'home-page-box',
    ],
    Properties: {
        services: GObject.ParamSpec.object('services', '', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            DiscoveryCenterServicesBundle.$gtype),
    },
}, class CodingDiscoveryCenterMainWindow extends Gtk.ApplicationWindow {
    _init(params) {
        super._init(params);

        const header = new Gtk.HeaderBar({
            visible: true,
            title: GLib.get_application_name(),
            show_close_button: true,
        });
        this.set_titlebar(header);

        const searchState = new DiscoveryCenterSearchState({});
        const searchBar = new DiscoveryCenterSearch({
            visible: true,
            state: searchState,
        });

        // Currently the way this works is that we show the search screen
        // unless we have no currently active search term, at which point
        // we go back to the home page.
        //
        // Perhaps in a future iteration we could have a more explicit
        // interaction here.
        searchState.connect('updated', () => {
            this.content_views.set_visible_child_name(searchState.active ? 'search' : 'home');
        });

        // Add a 'switch-category' action to the application
        // which we will connect to and use to switch categories.
        const switchCategoryAction = new Gio.SimpleAction({
            name: 'switch-category',
            parameter_type: new GLib.VariantType('s'),
        });
        switchCategoryAction.connect('activate', (action, parameter) => {
            const [page] = this.content_views.get_child_by_name('category').get_children();
            page.changeCategory(parameter.unpack());
            this.content_views.set_visible_child_name('category');
        });
        this.application.add_action(switchCategoryAction);

        this.content_search_box.add(searchBar);
        const homePage = new DiscoveryCenterHomePage({
            visible: true,
        });
        const searchPage = new DiscoveryCenterSearchResultsPage({
            visible: true,
            search_state: searchState,
        });
        const categoryPage = new DiscoveryCenterCategoryPage({
            visible: true,
        });

        homePage.connect('activate-item', this._activateItem.bind(this));
        searchPage.connect('activate-item', this._activateItem.bind(this));
        categoryPage.connect('activate-item', this._activateItem.bind(this));

        this.search_results_box.add(searchPage);
        this.home_page_box.add(homePage);
        this.category_box.add(categoryPage);
    }

    _activateItem(object, item) {
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


const CodingDiscoveryCenterApplication = GObject.registerClass(class extends Gtk.Application {
    _init() {
        this._mainWindow = null;

        super._init({application_id: pkg.name});
        GLib.set_application_name(_('Coding Discovery Center'));
    }

    vfunc_startup() {
        super.vfunc_startup();

        const settings = Gtk.Settings.get_default();
        settings.gtk_application_prefer_dark_theme = true;

        load_style_sheet('/com/endlessm/Coding/DiscoveryCenter/application.css');
    }

    vfunc_activate() {
        if (!this._mainWindow) {
            const servicesBundle = new DiscoveryCenterServicesBundle({
                game: new Service.GameService({}),
                application: this,
            });
            this._mainWindow = new CodingDiscoveryCenterMainWindow({
                application: this,
                services: servicesBundle,
            });
        }

        this._mainWindow.present();
    }
});


function main(argv) { // eslint-disable-line no-unused-vars
    return (new CodingDiscoveryCenterApplication()).run(argv);
}
