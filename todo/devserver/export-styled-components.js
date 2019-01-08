/**
 * @fileoverview Redefine the UMD exports from styled-components
 * We need to make the export structure is consistent with its CommonJS counterpart
 * otherwise our dev server won't work
 */
define(["styled-components"], function(loaded) {
  const namedExports = {
    default: loaded,
    css: loaded.css,
    keyframes: loaded.keyframes,
    createGlobalStyle: loaded.createGlobalStyle,
    isStyledComponent: loaded.isStyledComponent,
    ThemeConsumer: loaded.ThemeConsumer,
    ThemeContext: loaded.ThemeContext,
    ThemeProvider: loaded.ThemeProvider,
    withTheme: loaded.withTheme,
    ServerStyleSheet: loaded.ServerStyleSheet,
    StyleSheetManager: loaded.StyleSheetManager,
  };

  for (const k in loaded) {
    if (namedExports.hasOwnProperty(k)) {
      delete loaded[k];
    }
  }

  return namedExports;
});
