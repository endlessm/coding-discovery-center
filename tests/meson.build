# Copyright 2018 Endless Mobile, Inc.

javascript_tests = [
    'js/testDiscoveryCenter.js',
]

jasmine = find_program('jasmine')
test_runner = find_program('./tap.py')
source_root = meson.source_root()
include_path = '@0@:@1@'.format(source_root, join_paths(source_root, 'src'))
tests_environment = environment()
tests_environment.set('GJS_PATH', include_path)
tests_environment.set('G_TEST_SRCDIR', meson.current_source_dir())
tests_environment.set('G_TEST_BUILDDIR', meson.current_build_dir())
tests_environment.set('LC_ALL', 'C')

args = [jasmine.path(), '--no-config', '--tap']
if (jasmine_report_argument != '')
    args += [jasmine_report_argument]
endif

foreach test_file : javascript_tests
    srcdir_file = join_paths(meson.current_source_dir(), test_file)
    test(test_file, test_runner, env: tests_environment,
        args: args + [srcdir_file])
endforeach
