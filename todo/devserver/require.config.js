require.config({
  map: {
    '*': {
      // Reroute styled-components to our custom export script
      'styled-components': 'export-styled-components'
    },
    'export-styled-components': {
      'styled-components': 'styled-components'
    }
  },
  paths: {
    'react': 'react.development',
    'react-dom': 'react-dom.development'
  }
});
