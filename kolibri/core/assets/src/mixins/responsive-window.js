/*
  Apply this mixin to your vue components to get reactive information about window sizes.

  For example:

    <script>

      import responsiveWindow from 'kolibri.coreVue.mixins.responsiveWindow';

      export default {
        mixins: [responsiveWindow],
        props: {
    ...

  This adds a few new reactive properties to your vue model:

    this.windowHeight       // height in pixels
    this.windowWidth        // width in pixels
    this.windowBreakpoint   // breakpoint level as described below
    this.windowIsSmall      // boolean for small range (level < 2)
    this.windowIsMedium     // boolean for medium range (level = 2)
    this.windowIsLarge      // boolean for large range (level > 2)
    this.windowGridColumns  // number of grid columns for the current level
    this.windowGutter       // gutter width for the current window size

  The breakpoint levels are numbers following Material guidelinse:
    https://material.io/guidelines/layout/responsive-ui.html#responsive-ui-breakpoints

  Breakpoint Breakdown:

    level 0 (small)
      < 480 px
      portrait handset, xsmall window
      4 columns, 16px gutter

    level 1 (small)
      < 600 px
      landscape or large portait handset, small portrait tablet, xsmall window,
      4 columns, 16px gutter

    level 2 (medium)
      < 840 px
      large landscape handset, large portrait tablet, small window,
      8 columns, 16px gutter

    level 3 (large)
      < 960 px
      large landscape handset, large portrait tablet, small window,
      12 columns, 16px gutter

    level 4 (large)
      < 1280 px
      landscape tablet, small or medium window
      12 columns, 24px gutter

    level 5 (large)
      < 1440 px
      large landscape tablet, medium window
      12 columns, 24px gutter

    level 6 (large)
      < 1600 px
      large window
      12 columns, 24px gutter

    level 7 (large)
      >= 1600 px
      large or xlarge window
      12 columns, 24px gutter
*/

import { throttle } from 'frame-throttle';

/* module internal state */

const windowListeners = [];

/* methods */

function windowMetrics() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

const windowResizeHandler = throttle(() => {
  const metrics = windowMetrics();
  windowListeners.forEach(cb => cb(metrics));
});

function addWindowListener(cb) {
  windowListeners.push(cb);
  cb(windowMetrics()); // call it once initially
}

function removeWindowListener(cb) {
  windowListeners.splice(windowListeners.indexOf(cb), 1);
}

/* setup */

if (window.addEventListener) {
  window.addEventListener('resize', windowResizeHandler, true);
} else if (window.attachEvent) {
  window.attachEvent('onresize', windowResizeHandler);
}

windowResizeHandler(); // call it once initially

/* export mixin */

export default {
  data() {
    return {
      windowWidth: undefined,
      windowHeight: undefined,
      windowBreakpoint: undefined,
    };
  },
  // Implementing this as a watcher to work around
  // optimization issue: https://github.com/vuejs/vue/issues/8540
  watch: {
    windowWidth() {
      let newBreakpoint = undefined;
      const SCROLL_BAR = 16;
      if (this.windowWidth < 480) {
        newBreakpoint = 0;
      } else if (this.windowWidth < 600) {
        newBreakpoint = 1;
      } else if (this.windowWidth < 840) {
        newBreakpoint = 2;
      } else if (this.windowWidth < 960 - SCROLL_BAR) {
        newBreakpoint = 3;
      } else if (this.windowWidth < 1280 - SCROLL_BAR) {
        newBreakpoint = 4;
      } else if (this.windowWidth < 1440 - SCROLL_BAR) {
        newBreakpoint = 5;
      } else if (this.windowWidth < 1600 - SCROLL_BAR) {
        newBreakpoint = 6;
      } else {
        newBreakpoint = 7;
      }
      if (this.windowBreakpoint !== newBreakpoint) {
        this.windowBreakpoint = newBreakpoint;
      }
    },
  },
  computed: {
    windowIsLarge() {
      return this.windowBreakpoint > 2;
    },
    windowIsMedium() {
      return this.windowBreakpoint === 2;
    },
    windowIsSmall() {
      return this.windowBreakpoint < 2;
    },
    windowGridColumns() {
      if (this.windowIsSmall) {
        return 4;
      }
      if (this.windowIsMedium) {
        return 8;
      }
      // windowIsLarge
      return 12;
    },
    windowGutter() {
      if (this.windowIsSmall) {
        return 16;
      }
      /*
      commenting this logic out for now due to https://github.com/vuejs/vue/issues/8540

      // 16px when the smallest width of the device is < 600
      if (this.windowBreakpoint < 4 && Math.min(this.windowWidth, this.windowHeight) < 600) {
        return 16;
      }
      */
      return 24;
    },
  },
  methods: {
    _updateWindow(metrics) {
      this.windowWidth = metrics.width;
      this.windowHeight = metrics.height;
    },
  },
  mounted() {
    addWindowListener(this._updateWindow);
  },
  beforeDestroy() {
    removeWindowListener(this._updateWindow);
  },
};
