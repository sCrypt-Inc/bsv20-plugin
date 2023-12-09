
import fetch from 'cross-fetch';
export async function fetchBSV20ByOutpoint(outpoint, network) {

    //Select the correct api url based on network
    const satsApiUrl = process.env[`${network}_1SATS_API_URL`.toUpperCase()];

    const response = await fetch(`${satsApiUrl}/txos/${outpoint}?script=false`);

    if(response.status === 200) {
        return response.json();
    }

    return null;
}