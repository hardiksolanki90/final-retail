import { getAreaOptions } from '../api/AreaApi';
import { getRegionOptions } from '../api/RegionApi';
import { getAllCountries, getAllCountryMasters } from '../api/CountryApi';
import { getBeatOptions } from '../api/BeatApi';
import { getDepotOptions } from '../api/DepotApi';
import type { SelectOption } from '../components/ui/Select';

interface CacheItem<T> {
  data: T | null;
  promise: Promise<T> | null;
}

const cache = {
  areas: { data: null, promise: null } as CacheItem<SelectOption[]>,
  regions: { data: null, promise: null } as CacheItem<SelectOption[]>,
  countries: { data: null, promise: null } as CacheItem<SelectOption[]>,
  beats: { data: null, promise: null } as CacheItem<SelectOption[]>,
  depots: { data: null, promise: null } as CacheItem<SelectOption[]>,
};

export const optionsCache = {
  async getAreas(): Promise<SelectOption[]> {
    if (cache.areas.data) return cache.areas.data;
    if (cache.areas.promise) return cache.areas.promise;

    cache.areas.promise = (async () => {
      try {
        const opts = await getAreaOptions();
        const mapped = opts.map((a: any) => ({
          value: a.value ?? a.id,
          label: a.label ?? ((a.areaCode ?? a.code) ? `${a.areaCode ?? a.code} - ${a.areaName ?? a.name}` : (a.areaName ?? a.name ?? String(a.id))),
        }));
        cache.areas.data = mapped;
        return mapped;
      } catch (err) {
        console.error('Failed to load area options:', err);
        return [];
      } finally {
        cache.areas.promise = null;
      }
    })();

    return cache.areas.promise;
  },

  async getRegions(): Promise<SelectOption[]> {
    if (cache.regions.data) return cache.regions.data;
    if (cache.regions.promise) return cache.regions.promise;

    cache.regions.promise = (async () => {
      try {
        const opts = await getRegionOptions();
        const mapped = opts.map((r: any) => ({
          value: r.value ?? r.id,
          label: r.label ?? ((r.regionCode ?? r.code) ? `${r.regionCode ?? r.code} - ${r.regionName ?? r.name}` : (r.regionName ?? r.name ?? String(r.id))),
        }));
        cache.regions.data = mapped;
        return mapped;
      } catch (err) {
        console.error('Failed to load region options:', err);
        return [];
      } finally {
        cache.regions.promise = null;
      }
    })();

    return cache.regions.promise;
  },

  async getCountries(): Promise<SelectOption[]> {
    if (cache.countries.data) return cache.countries.data;
    if (cache.countries.promise) return cache.countries.promise;

    cache.countries.promise = (async () => {
      try {
        let countries = await getAllCountries();
        if (!countries || countries.length === 0) {
          const masters = await getAllCountryMasters();
          countries = masters.map((m: any) => ({
            id: m.id,
            uuid: m.uuid,
            name: m.name,
            countryCode: m.iso2 ?? (m as any).code ?? '',
          }));
        }
        const mapped = countries.map((c: any) => ({
          value: c.id,
          label: c.countryCode ? `${c.countryCode} - ${c.name}` : c.name,
        }));
        cache.countries.data = mapped;
        return mapped;
      } catch (err) {
        console.error('Failed to load country options:', err);
        return [];
      } finally {
        cache.countries.promise = null;
      }
    })();

    return cache.countries.promise;
  },

  async getBeats(): Promise<SelectOption[]> {
    if (cache.beats.data) return cache.beats.data;
    if (cache.beats.promise) return cache.beats.promise;

    cache.beats.promise = (async () => {
      try {
        const opts = await getBeatOptions();
        const mapped = opts.map((b: any) => ({
          value: b.value ?? b.id,
          label: b.label ?? ((b.beatCode ?? b.code) ? `${b.beatCode ?? b.code} - ${b.beatName ?? b.name}` : (b.beatName ?? b.name ?? String(b.id))),
        }));
        cache.beats.data = mapped;
        return mapped;
      } catch (err) {
        console.error('Failed to load beat options:', err);
        return [];
      } finally {
        cache.beats.promise = null;
      }
    })();

    return cache.beats.promise;
  },

  async getDepots(): Promise<SelectOption[]> {
    if (cache.depots.data) return cache.depots.data;
    if (cache.depots.promise) return cache.depots.promise;

    cache.depots.promise = (async () => {
      try {
        const opts = await getDepotOptions();
        const mapped = opts.map((d: any) => ({
          value: d.value ?? d.id,
          label: d.label ?? `${d.depotCode ?? d.code} - ${d.depotName ?? d.name}`,
        }));
        cache.depots.data = mapped;
        return mapped;
      } catch (err) {
        console.error('Failed to load depot options:', err);
        return [];
      } finally {
        cache.depots.promise = null;
      }
    })();

    return cache.depots.promise;
  },

  addArea(opt: SelectOption) {
    if (cache.areas.data) {
      cache.areas.data = [opt, ...cache.areas.data.filter((o) => String(o.value) !== String(opt.value))];
    } else {
      cache.areas.data = [opt];
    }
  },

  addRegion(opt: SelectOption) {
    if (cache.regions.data) {
      cache.regions.data = [opt, ...cache.regions.data.filter((o) => String(o.value) !== String(opt.value))];
    } else {
      cache.regions.data = [opt];
    }
  },

  addBeat(opt: SelectOption) {
    if (cache.beats.data) {
      cache.beats.data = [opt, ...cache.beats.data.filter((o) => String(o.value) !== String(opt.value))];
    } else {
      cache.beats.data = [opt];
    }
  },

  invalidate(type?: 'areas' | 'regions' | 'countries' | 'beats' | 'depots') {
    if (type) {
      cache[type] = { data: null, promise: null };
    } else {
      cache.areas = { data: null, promise: null };
      cache.regions = { data: null, promise: null };
      cache.countries = { data: null, promise: null };
      cache.beats = { data: null, promise: null };
      cache.depots = { data: null, promise: null };
    }
  },
};

export default optionsCache;
