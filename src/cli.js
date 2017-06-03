import { resolve } from 'path'

import {
  observeFilePatterns,
  readFile,
  parse,
} from './lib'

const KIBANA_DIR = resolve(__dirname, '../../kibana')
// eslint-disable-next-line import/no-dynamic-require
const babelOptions = require(resolve(KIBANA_DIR, 'src/optimize/babel/options')).node

observeFilePatterns({
  cwd: KIBANA_DIR,
  patterns: [
    'src/**/*.js',

    // decorators
    '!src/ui/public/bind/bind.js',
    '!src/ui/public/fancy_forms/fancy_forms.js',
    '!src/ui/public/listen/listen.js',
    '!src/ui/public/watch_multi/watch_multi.js',

    // registry stuff
    '!src/core_plugins/dev_mode/public/vis_debug_spy_panel.js',
    '!src/core_plugins/kbn_vislib_vis_types/public/kbn_vislib_vis_types.js',
    '!src/core_plugins/region_map/public/region_map_vis.js',
    '!src/core_plugins/spy_modes/public/req_resp_stats_spy_mode.js',
    '!src/core_plugins/spy_modes/public/table_spy_mode.js',
    '!src/core_plugins/tagcloud/public/tag_cloud_vis.js',
    '!src/ui/public/stringify/register.js',
    '!src/core_plugins/console/public/hacks/register.js',
    '!src/core_plugins/getting_started/public/lib/register_management_section.js',
    '!src/core_plugins/kbn_doc_views/public/views/json.js',
    '!src/core_plugins/kbn_doc_views/public/views/table.js',

    // app roots
    '!src/core_plugins/kibana/public/kibana.js',
    '!src/core_plugins/console/public/console.js',
    '!src/core_plugins/status_page/public/status_page.js',
    '!src/core_plugins/testbed/public/testbed.js',
    '!src/core_plugins/timelion/public/app.js',
    '!src/core_plugins/console/public/tests/tests.js',
    '!src/core_plugins/kibana/public/discover/index.js',
    '!src/core_plugins/kibana/public/visualize/index.js',

    // dynamic providers
    '!src/ui/public/directives/inequality.js',
    '!src/ui/public/directives/kbn_src.js',
    '!src/ui/public/storage/storage.js',

    // dynamic module
    '!src/ui/public/tooltip/tooltip.js',

    // amd
    '!src/ui/public/utils/ipv4_address.js',
    '!src/ui/public/utils/mapping_setup.js',
    '!src/ui/public/vis/agg_config_result.js',
    '!src/core_plugins/console/public/src/curl.js',
    '!src/core_plugins/kibana/public/discover/_hit_sort_fn.js',
    '!src/ui/public/agg_response/hierarchical/_collect_branch.js',

    // commonjs
    // '!src/core_plugins/timelion/**/*',
    // '!src/core_plugins/console/public/src/controllers/sense_controller.js',
    // '!src/core_plugins/console/public/src/directives/sense_help.js',

    // import alias
    '!src/core_plugins/testbed/public/index.js',
    '!src/ui/public/check_box/index.js',
    '!src/ui/public/pager/index.js',
    '!src/ui/public/pager_control/index.js',
    '!src/ui/public/autoload/*',
    '!src/ui/public/promises/index.js',
    '!src/ui/public/share/index.js',
    '!src/ui/public/sortable_column/index.js',
    '!src/ui/public/table_info/index.js',
    '!src/ui/public/toggle_button/index.js',
    '!src/ui/public/toggle_panel/index.js',
    '!src/core_plugins/kibana/public/doc/index.js',
    '!src/ui/public/chrome/services/index.js',
    '!src/ui/public/stringify/icons/index.js',

    // weird side-effects
    '!src/core_plugins/timelion/public/app_with_autoload.js',
    '!src/ui/public/style_compile/style_compile.js',

    // routes
    '!src/core_plugins/getting_started/public/getting_started_route.js',
    '!src/core_plugins/state_session_storage_redirect/public/index.js',
    '!src/ui/public/error_url_overflow/error_url_overflow.js',
    '!src/core_plugins/kibana/public/context/index.js',
    '!src/core_plugins/kibana/public/dashboard/index.js',
    '!src/core_plugins/kibana/public/dev_tools/index.js',

    // modules that don't export anything
    '!src/core_plugins/getting_started/public/index.js',
    '!src/core_plugins/kbn_doc_views/public/kbn_doc_views.js',
    '!src/cli/index.js',
    '!src/cli/cli.js',
    '!src/cli_plugin/index.js',
    '!src/cli_plugin/cli.js',
    '!src/es_archiver/cli.js',
    '!src/jest/cli.js',
    '!src/functional_test_runner/cli.js',
    '!src/optimize/babel/register.js',
    '!src/optimize/babel/polyfills.js',

    // third-party code
    '!src/ui/public/angular-bootstrap/**/*',
    '!**/webpackShims/**/*',

    '!**/__tests__/**/*',
    '!**/fixtures/**/*',
  ],
})
.mergeMap(async file => ({
  ...file,
  contents: await readFile(file.path, 'utf8'),
}))
.map(file => ({
  ...file,
  exports: parse(file, babelOptions),
}))
.filter(file => !file.exports.length)
.subscribe({
  next: file => {
    debugger
    console.log(file)
  },
  error: error => console.error(error.stack),
  complete: () => console.log('complete'),
})
