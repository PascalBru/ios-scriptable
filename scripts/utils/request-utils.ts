export async function fetchJSONData(url: string, transformJson: (data) => void, errorJson?: () => void): Promise<any> {
    console.log('start fetch of data: '+url);
    const req = new Request(url)
    try {
      let data = await req.loadJSON();
      return transformJson(data);
    } catch(e) {
      console.error(e)
      console.error(req.response)
      if(errorJson == undefined) {
        return undefined;
      }
      else {
        return errorJson();
      }
    }    
}
