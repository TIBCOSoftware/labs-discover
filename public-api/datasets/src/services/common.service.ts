import axios from "axios";
import { Service } from "typedi";

@Service()
export class CommonService {

  constructor () {

  }

  public validateToken = async (token: string): Promise<any> => {
    const body = {
      "credentials": token
    }
    return await axios.post('http://orchestrator-service-pub:8080/login/validate', body).then(resp => {
      return resp;
    }).catch(error => {
      return error.response;
    })
  }

  
}
