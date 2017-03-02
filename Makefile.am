# Resources
resource_files = $(shell $(GLIB_COMPILE_RESOURCES) --sourcedir=$(srcdir)/src --sourcedir=$(builddir)/src --generate-dependencies $(srcdir)/src/com.endlessm.Coding.DiscoveryCenter.src.gresource.xml)
app_resource_files = $(shell $(GLIB_COMPILE_RESOURCES) --sourcedir=$(srcdir)/data --sourcedir=$(builddir)/data --generate-dependencies $(srcdir)/data/com.endlessm.Coding.DiscoveryCenter.data.gresource.xml)

resourcedir = $(pkgdatadir)
resource_DATA = \
	data/com.endlessm.Coding.DiscoveryCenter.data.gresource \
	src/com.endlessm.Coding.DiscoveryCenter.src.gresource \
	$(NULL)

applicationsdir = $(datadir)/applications
applications_DATA = data/com.endlessm.Coding.DiscoveryCenter.desktop

# Tests
javascript_tests = \
	tests/js/testDiscoveryCenter.js \
	$(NULL)

# All JS files (used for linting)
all_js_files = \
	$(javascript_tests) \
	$(resource_files) \
	$(NULL)

# Set EXTRA_DIST and CLEANFILES initially
EXTRA_DIST = \
	$(resource_files) \
	$(javascript_tests) \
	$(app_resource_files) \
	src/com.endlessm.Coding.DiscoveryCenter.in \
	src/com.endlessm.Coding.DiscoveryCenter.src.gresource.xml \
	data/com.endlessm.Coding.DiscoveryCenter.data.gresource.xml \
	data/com.endlessm.Coding.DiscoveryCenter.desktop \
	$(NULL)

data/com.endlessm.Coding.DiscoveryCenter.data.gresource: $(srcdir)/data/com.endlessm.Coding.DiscoveryCenter.data.gresource.xml $(app_resource_files) Makefile
	$(AM_V_GEN) mkdir -p data && \
	$(GLIB_COMPILE_RESOURCES) --target=$@ --sourcedir=$(srcdir)/data $<

src/com.endlessm.Coding.DiscoveryCenter.src.gresource: $(srcdir)/src/com.endlessm.Coding.DiscoveryCenter.src.gresource.xml $(resource_files) Makefile
	$(AM_V_GEN) mkdir -p src && \
	$(GLIB_COMPILE_RESOURCES) --target=$@ --sourcedir=$(srcdir)/src $<

src/com.endlessm.Coding.DiscoveryCenter: $(srcdir)/src/com.endlessm.Coding.DiscoveryCenter.in Makefile
	$(AM_V_GEN) mkdir -p src && \
	sed -e "s|[@]GJS@|$(GJS)|g" \
	    -e "s|[@]PACKAGE_VERSION@|$(PACKAGE_VERSION)|g" \
	    -e "s|[@]prefix@|$(prefix)|g" \
	    -e "s|[@]libdir@|$(libdir)|g" \
	    -e "s|[@]pkgdatadir@|$(pkgdatadir)|g" \
	    $< > $@ && \
	chmod +x $@

# Scripts to install
bin_SCRIPTS = src/com.endlessm.Coding.DiscoveryCenter

# Distclean
CLEANFILES = \
	$(resource_DATA) \
	$(service_DATA) \
	src/com.endlessm.Coding.DiscoveryCenter \
	$(NULL)

#  Run tests when running 'make check'
TESTS = \
	$(javascript_tests) \
	run_coverage.coverage \
	run_eslint.eslint \
	$(NULL)
LOG_COMPILER = gtester
AM_LOG_FLAGS = -k --verbose

TEST_EXTENSIONS = .js .coverage .eslint

JS_LOG_DRIVER = env AM_TAP_AWK='$(AWK)' $(SHELL) $(top_srcdir)/tap-driver.sh
JS_LOG_DRIVER_FLAGS = --comments
JS_LOG_COMPILER = jasmine
AM_JS_LOG_FLAGS = --tap --no-config @JASMINE_REPORT_ARGUMENT@

# Use locally built versions of S modules, and
# libraries. We clobber GJS_PATH and include the js directory and the
# $(top_srcdir) for including test helper files.
# (May need to change to AM_TESTS_ENVIRONMENT in a later version of Automake)
TESTS_ENVIRONMENT = \
	export GJS_PATH="$(top_srcdir):$(top_srcdir)/src"; \
	export GI_TYPELIB_PATH="$(top_builddir)$${GI_TYPELIB_PATH:+:$$GI_TYPELIB_PATH}"; \
	export LD_LIBRARY_PATH="$(top_builddir)/.libs$${LD_LIBRARY_PATH:+:$$LD_LIBRARY_PATH}"; \
	export G_TEST_SRCDIR="$(abs_srcdir)/tests"; \
	export G_TEST_BUILDDIR="$(abs_builddir)/tests"; \
	export LC_ALL=C; \
	$(NULL)

# # # COVERAGE # # #

# Don't specify the resource:/// URIs here, because the tests load modules from
# the local directory, not from the GResource
EOS_JS_COVERAGE_FILES := $(patsubst $(srcdir)/%,%,$(wildcard $(srcdir)/src/*.js))

@EOS_COVERAGE_RULES@

# # # LINTING # # #
EOS_ESLINT_FILES := $(all_js_files)

@EOS_ESLINT_RULES@

AM_JS_LOG_FLAGS += @EOS_JS_COVERAGE_LOG_FLAGS@
