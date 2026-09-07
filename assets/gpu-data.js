export const GPU_DATA = [
  { id:'rtx-5090', brand:'NVIDIA', name:'GeForce RTX 5090', psu:1000, board:575, connector:{ type:'hybrid16', eightPin:4, nativeWatts:600 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/' },
  { id:'rtx-5080', brand:'NVIDIA', name:'GeForce RTX 5080', psu:850, board:360, connector:{ type:'hybrid16', eightPin:3, nativeWatts:450 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/' },
  { id:'rtx-5070-ti', brand:'NVIDIA', name:'GeForce RTX 5070 Ti', psu:750, board:300, connector:{ type:'hybrid16', eightPin:2, nativeWatts:300 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/' },
  { id:'rtx-5070', brand:'NVIDIA', name:'GeForce RTX 5070', psu:650, board:250, connector:{ type:'hybrid16', eightPin:2, nativeWatts:300 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/' },
  { id:'rtx-5060-ti', brand:'NVIDIA', name:'GeForce RTX 5060 Ti', psu:600, board:180, connector:{ type:'hybrid16', eightPin:1, nativeWatts:300 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/' },
  { id:'rtx-5060', brand:'NVIDIA', name:'GeForce RTX 5060', psu:550, board:145, connector:{ type:'hybrid16', eightPin:1, nativeWatts:300 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/' },
  { id:'rtx-4090', brand:'NVIDIA', name:'GeForce RTX 4090', psu:850, board:450, connector:{ type:'hybrid16', eightPin:3, nativeWatts:450 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/' },
  { id:'rtx-4080-super', brand:'NVIDIA', name:'GeForce RTX 4080 SUPER', psu:750, board:320, connector:{ type:'hybrid16', eightPin:3, nativeWatts:450 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/' },
  { id:'rtx-4070-ti-super', brand:'NVIDIA', name:'GeForce RTX 4070 Ti SUPER', psu:700, board:285, connector:{ type:'hybrid16', eightPin:2, nativeWatts:300 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/' },
  { id:'rtx-4070-super', brand:'NVIDIA', name:'GeForce RTX 4070 SUPER', psu:650, board:220, connector:{ type:'hybrid16', eightPin:2, nativeWatts:300 }, source:'https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/' },
  { id:'rx-9070-xt', brand:'AMD', name:'Radeon RX 9070 XT', psu:750, board:304, connector:{ type:'pcie8', eightPin:2 }, source:'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070xt.html' },
  { id:'rx-9070', brand:'AMD', name:'Radeon RX 9070', psu:650, board:220, connector:{ type:'pcie8', eightPin:2 }, source:'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070.html' },
  { id:'rx-7900-xtx', brand:'AMD', name:'Radeon RX 7900 XTX', psu:800, board:355, connector:{ type:'pcie8', eightPin:2 }, source:'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xtx.html' },
  { id:'rx-7900-xt', brand:'AMD', name:'Radeon RX 7900 XT', psu:750, board:315, connector:{ type:'pcie8', eightPin:2 }, source:'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xt.html' },
  { id:'rx-7800-xt', brand:'AMD', name:'Radeon RX 7800 XT', psu:700, board:263, connector:{ type:'pcie8', eightPin:2 }, source:'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7800-xt.html' },
  { id:'rx-7700-xt', brand:'AMD', name:'Radeon RX 7700 XT', psu:700, board:245, connector:{ type:'pcie8', eightPin:2 }, source:'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7700-xt.html' },
  { id:'rx-7600-xt', brand:'AMD', name:'Radeon RX 7600 XT', psu:600, board:190, connector:{ type:'pcie8', eightPin:2 }, source:'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7600-xt.html' },
  { id:'rx-7600', brand:'AMD', name:'Radeon RX 7600', psu:550, board:165, connector:{ type:'pcie8', eightPin:1 }, source:'https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7600.html' }
];

export const gpuById = id => GPU_DATA.find(gpu => gpu.id === id);
