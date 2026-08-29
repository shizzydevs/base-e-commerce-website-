import { useContext } from 'react';
import { LocationContext } from './locationContextObject';

export const useLocation = () => useContext(LocationContext);