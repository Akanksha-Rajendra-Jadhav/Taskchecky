import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
export default function useList(path, params) {
  const [items, setItems] = useState([]); const [err, setErr] = useState('');
  const key = JSON.stringify(params || {});
  const reload = useCallback(() => api.get(path, { params: JSON.parse(key) }).then(r => setItems(r.data)).catch(e => setErr(errMsg(e))), [path, key]);
  useEffect(() => { reload(); window.addEventListener('tc:refresh', reload); return () => window.removeEventListener('tc:refresh', reload); }, [reload]);
  return { items, reload, err };
}
