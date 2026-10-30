import acaiBocaRoxa from '@/assets/logos/acai-boca-roxa.png';
import coopenorte from '@/assets/logos/coopenorte.png';
import eletromoveis from '@/assets/logos/eletromoveis.png';
import fazz from '@/assets/logos/fazz.jpeg';
import ggEletronicos from '@/assets/logos/gg-eletronicos.png';
import leoSousa from '@/assets/logos/leo-sousa.png';
import maeDeSagui from '@/assets/logos/mae-de-sagui.png';
import nokia from '@/assets/logos/nokia.png';
import ramosSst from '@/assets/logos/ramos-sst.png';
import sapatilhasCom from '@/assets/logos/sapatilhas-com.png';
import seaTelecom from '@/assets/logos/sea-telecom.png';
import skyfit from '@/assets/logos/skyfit.png';
import yedaCarvalho from '@/assets/logos/yeda-carvalho.png';
import proCardiaco from '@/assets/logos/pro-cardiaco.png';

export interface Client {
  name: string;
  logo: ImageMetadata;
  /** circle: recorte redondo (JPEG sem transparência); brighten: logo escura que some no preto. */
  treatment?: 'circle' | 'brighten';
}

export interface Person {
  handle: string;
  url: string;
}

export const clients: Client[] = [
  { name: 'Açaí Boca Roxa', logo: acaiBocaRoxa },
  { name: 'Coopenorte', logo: coopenorte },
  { name: 'Eletromóveis', logo: eletromoveis },
  { name: 'Fazz', logo: fazz, treatment: 'circle' },
  { name: 'GG Eletrônicos', logo: ggEletronicos },
  { name: 'Léo Sousa', logo: leoSousa },
  { name: 'Mãe de Sagui', logo: maeDeSagui },
  { name: 'Nokia', logo: nokia },
  { name: 'Ramos SST', logo: ramosSst },
  { name: 'Sapatilhas.com', logo: sapatilhasCom },
  { name: 'SEA Telecom', logo: seaTelecom },
  { name: 'Skyfit', logo: skyfit },
  { name: 'Yêda Carvalho', logo: yedaCarvalho, treatment: 'brighten' },
  { name: 'Clínica Pró-Cardíaco', logo: proCardiaco, treatment: 'brighten' },
];

// Vazia por enquanto. Para incluir um @, é só acrescentar uma linha aqui.
export const people: Person[] = [];
