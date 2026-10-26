// Bright stars, J2000: [id, RA hours, Dec degrees, visual magnitude]. About 130 stars down to
// magnitude ~3.5 plus the fainter members of Lyra, Aquila and Cygnus so the Summer Triangle reads.
// Sources: Hipparcos / Yale Bright Star values as commonly tabulated; precision ~0.01 h / 0.01°.
export type Star = readonly [id: string, ra: number, dec: number, mag: number];

export const STARS: readonly Star[] = [
  ['Sirius', 6.752, -16.716, -1.46], ['Canopus', 6.399, -52.696, -0.74], ['RigilKent', 14.660, -60.834, -0.27],
  ['Arcturus', 14.261, 19.182, -0.05], ['Vega', 18.616, 38.784, 0.03], ['Capella', 5.278, 45.998, 0.08],
  ['Rigel', 5.242, -8.202, 0.13], ['Procyon', 7.655, 5.225, 0.34], ['Achernar', 1.629, -57.237, 0.46],
  ['Betelgeuse', 5.919, 7.407, 0.42], ['Hadar', 14.064, -60.373, 0.61], ['Altair', 19.846, 8.868, 0.76],
  ['Acrux', 12.443, -63.099, 0.76], ['Aldebaran', 4.599, 16.509, 0.86], ['Antares', 16.490, -26.432, 1.06],
  ['Spica', 13.420, -11.161, 0.97], ['Pollux', 7.755, 28.026, 1.14], ['Fomalhaut', 22.961, -29.622, 1.16],
  ['Deneb', 20.690, 45.280, 1.25], ['Mimosa', 12.795, -59.689, 1.25], ['Regulus', 10.139, 11.967, 1.40],
  ['Adhara', 6.977, -28.972, 1.50], ['Castor', 7.577, 31.888, 1.58], ['Shaula', 17.560, -37.104, 1.62],
  ['Bellatrix', 5.419, 6.350, 1.64], ['Elnath', 5.438, 28.608, 1.65], ['Alnilam', 5.604, -1.202, 1.69],
  ['Alnair', 22.137, -46.961, 1.73], ['Alnitak', 5.679, -1.943, 1.77], ['Alioth', 12.900, 55.960, 1.77],
  ['Dubhe', 11.062, 61.751, 1.79], ['Mirfak', 3.405, 49.861, 1.80], ['Wezen', 7.140, -26.393, 1.84],
  ['KausAustralis', 18.403, -34.385, 1.85], ['Alkaid', 13.792, 49.313, 1.86], ['Sargas', 17.622, -42.998, 1.87],
  ['Menkalinan', 5.992, 44.948, 1.90], ['Alhena', 6.629, 16.399, 1.92], ['Peacock', 20.427, -56.735, 1.94],
  ['Mirzam', 6.378, -17.956, 1.98], ['Alphard', 9.460, -8.659, 1.98], ['Polaris', 2.530, 89.264, 1.98],
  ['Hamal', 2.120, 23.463, 2.00], ['Diphda', 0.726, -17.987, 2.04], ['Mizar', 13.399, 54.925, 2.04],
  ['Nunki', 18.921, -26.297, 2.05], ['Mirach', 1.162, 35.621, 2.05], ['Alpheratz', 0.140, 29.091, 2.06],
  ['Menkent', 14.112, -36.370, 2.06], ['Rasalhague', 17.582, 12.560, 2.07], ['Kochab', 14.845, 74.156, 2.08],
  ['Algieba', 10.333, 19.842, 2.08], ['Saiph', 5.796, -9.670, 2.09], ['Algol', 3.136, 40.956, 2.12],
  ['Denebola', 11.818, 14.572, 2.14], ['Alphecca', 15.578, 26.715, 2.23], ['Mintaka', 5.533, -0.299, 2.23],
  ['Sadr', 20.370, 40.257, 2.23], ['Eltanin', 17.943, 51.489, 2.23], ['Schedar', 0.675, 56.537, 2.24],
  ['Almach', 2.065, 42.330, 2.26], ['Caph', 0.153, 59.150, 2.27], ['Dschubba', 16.006, -22.622, 2.29],
  ['EpsSco', 16.836, -34.293, 2.29], ['Merak', 11.031, 56.382, 2.37], ['Izar', 14.750, 27.074, 2.37],
  ['Enif', 21.736, 9.875, 2.39], ['KapSco', 17.708, -39.030, 2.39], ['Scheat', 23.063, 28.083, 2.42],
  ['Sabik', 17.173, -15.725, 2.43], ['Phecda', 11.897, 53.695, 2.44], ['Alderamin', 21.310, 62.586, 2.46],
  ['GamCas', 0.945, 60.717, 2.47], ['GienahCyg', 20.770, 33.970, 2.48], ['Markab', 23.079, 15.205, 2.49],
  ['Graffias', 16.091, -19.805, 2.56], ['ZetOph', 16.619, -10.567, 2.56], ['Zosma', 11.235, 20.524, 2.56],
  ['Ascella', 19.043, -29.880, 2.60], ['Unukalhai', 15.738, 6.426, 2.63], ['Ruchbah', 1.430, 60.235, 2.68],
  ['Muphrid', 13.912, 18.398, 2.68], ['Lesath', 17.513, -37.296, 2.69], ['KausMedia', 18.350, -29.828, 2.70],
  ['Tarazed', 19.771, 10.613, 2.72], ['DelOph', 16.239, -3.694, 2.74], ['Cebalrai', 17.724, 4.567, 2.76],
  ['Kornephoros', 16.504, 21.490, 2.78], ['Rastaban', 17.507, 52.301, 2.79], ['ZetHer', 16.688, 31.603, 2.81],
  ['KausBorealis', 18.466, -25.421, 2.82], ['Algenib', 0.220, 15.183, 2.83], ['DenebAlgedi', 21.784, -16.127, 2.85],
  ['DelCyg', 19.750, 45.131, 2.87], ['PiSco', 15.981, -26.114, 2.89], ['Sadalsuud', 21.526, -5.571, 2.90],
  ['Sadalmelik', 22.096, -0.320, 2.95], ['AlnaslSgr', 18.096, -30.424, 2.98], ['ZetAql', 19.090, 13.863, 2.99],
  ['Seginus', 14.535, 38.308, 3.03], ['Dabih', 20.350, -14.781, 3.05], ['Albireo', 19.512, 27.960, 3.05],
  ['Pherkad', 15.345, 71.834, 3.05], ['PiHer', 17.251, 36.809, 3.16], ['PhiSgr', 18.761, -26.991, 3.17],
  ['ThetAql', 20.188, -0.821, 3.24], ['Sulafat', 18.982, 32.690, 3.25], ['Megrez', 12.257, 57.033, 3.31],
  ['TauSgr', 19.116, -27.670, 3.32], ['DelAql', 19.425, 3.115, 3.36], ['Segin', 1.907, 63.670, 3.37],
  ['LamAql', 19.102, -4.883, 3.43], ['Sheliak', 18.835, 33.363, 3.45], ['DelBoo', 15.258, 33.315, 3.47],
  ['Nekkar', 15.032, 40.390, 3.49], ['EtaHer', 16.715, 38.922, 3.49], ['Alshain', 19.922, 6.407, 3.71],
  ['EpsHer', 17.005, 30.926, 3.92], ['DelLyr', 18.908, 36.899, 4.30], ['ZetLyr', 18.746, 37.605, 4.36],
  ['EpsLyr', 18.738, 39.613, 4.60],
];

/** Constellation lines as pairs of star ids. Only the figures that help find Vega and Altair. */
export const LINES: readonly (readonly [string, string])[] = [
  // Lyra: the small parallelogram hanging from Vega
  ['Vega', 'EpsLyr'], ['Vega', 'ZetLyr'], ['ZetLyr', 'Sheliak'], ['Sheliak', 'Sulafat'], ['Sulafat', 'DelLyr'], ['DelLyr', 'ZetLyr'],
  // Aquila: Altair flanked by Tarazed and Alshain, then the body
  ['Tarazed', 'Altair'], ['Altair', 'Alshain'], ['Altair', 'DelAql'], ['DelAql', 'ZetAql'], ['DelAql', 'ThetAql'], ['DelAql', 'LamAql'],
  // Cygnus: the Northern Cross
  ['Deneb', 'Sadr'], ['Sadr', 'Albireo'], ['DelCyg', 'Sadr'], ['Sadr', 'GienahCyg'],
  // Summer Triangle
  ['Vega', 'Deneb'], ['Deneb', 'Altair'], ['Altair', 'Vega'],
  // Scorpius and the Teapot, low in the south
  ['Graffias', 'Dschubba'], ['Dschubba', 'PiSco'], ['Dschubba', 'Antares'], ['Antares', 'EpsSco'], ['EpsSco', 'KapSco'], ['KapSco', 'Shaula'], ['Shaula', 'Lesath'], ['KapSco', 'Sargas'],
  ['KausAustralis', 'KausMedia'], ['KausMedia', 'KausBorealis'], ['KausBorealis', 'PhiSgr'], ['PhiSgr', 'Nunki'], ['Nunki', 'TauSgr'], ['TauSgr', 'Ascella'], ['Ascella', 'PhiSgr'], ['Ascella', 'KausAustralis'], ['KausMedia', 'AlnaslSgr'],
  // Big Dipper and Cassiopeia, for orientation
  ['Dubhe', 'Merak'], ['Merak', 'Phecda'], ['Phecda', 'Megrez'], ['Megrez', 'Dubhe'], ['Megrez', 'Alioth'], ['Alioth', 'Mizar'], ['Mizar', 'Alkaid'],
  ['Caph', 'Schedar'], ['Schedar', 'GamCas'], ['GamCas', 'Ruchbah'], ['Ruchbah', 'Segin'],
  // Great Square of Pegasus
  ['Markab', 'Scheat'], ['Scheat', 'Alpheratz'], ['Alpheratz', 'Algenib'], ['Algenib', 'Markab'],
];
