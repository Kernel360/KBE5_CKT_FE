export type LatLng = {
  lat: number;
  lon: number;
};

export const getAddressFromCoord = async (lat: number, lon: number): Promise<string> => {
  const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lon}&y=${lat}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_MAP_REST_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('카카오 주소 변환 실패');
  }

  const data = await response.json();
  const address = data.documents?.[0]?.address?.address_name;

  return address;
};
