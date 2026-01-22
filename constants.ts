
import { School, Gender } from './types';

export const INITIAL_SCHOOL: School = {
  id: '1',
  year: '2023/2024',
  semester: 'Ganjil',
  name: 'SMA Negeri Percontohan',
  npsn: '12345678',
  address: 'Jl. Pendidikan No. 123, Kota Cerdas',
  principal: 'Dr. Ahmad Sukamto, M.Pd.',
  logo: 'https://picsum.photos/200/200?random=1'
};

export const GENDERS = [Gender.L, Gender.P];
