export interface User {
  id: number;
  name: string;
  mobNumer: string;  
  address: {
    addline1: string;
    addline2: string;
    city: string;
    state: string;
    zipCode: string;
  };
}
