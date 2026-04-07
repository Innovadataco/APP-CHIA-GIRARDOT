/**
 * ITS Database Handler (IndexedDB)
 * Chía-Girardot Highway Project
 * Replacing hardcoded constants with a structured local DB.
 */

class ITSDatabase {
    constructor() {
        this.dbName = 'ITS_CHIA_GIRARDOT_DB';
        this.version = 13;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            console.log(`🚀 Initializing ITS Database v${this.version}...`);
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                console.log('🔄 Database upgrade/reset required...');
                const stores = ['eov','dom','as','se','sub', 'fn', 'cc', 'no'];
                stores.forEach(s => {
                    if (db.objectStoreNames.contains(s)) db.deleteObjectStore(s);
                    db.createObjectStore(s, { keyPath: (s === 'fn' || s === 'cc' || s === 'eov') ? 'id' : 'cod' });
                });
                // Force re-seed flag
                this._needsSeed = true;
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                this.seedIfNeeded()
                    .then(() => resolve(this.db))
                    .catch(err => {
                        console.error('Seed failure but continuing:', err);
                        resolve(this.db);
                    });
            };

            request.onerror = (e) => reject('Database error: ' + e.target.errorCode);
        });
    }

    async seedIfNeeded() {
        // Seed if store is empty OR if we just upgraded
        const count = await this.count('eov');
        if (count === 0 || this._needsSeed) {
            console.log('🌱 Seeding ITS Database from official source script...');
            try {
                const data = window.ITS_OFFICIAL_DATA;
                if (!data) throw new Error('window.ITS_OFFICIAL_DATA not found');

                const stores = ['dom', 'as', 'se', 'sub', 'fn', 'cc', 'no', 'eov'];
                for (const s of stores) {
                    await this.clearStore(s);
                    await this.seed(s, data[s]);
                }
                
                console.log('✅ Seeding complete. Official ITS V0 data synchronized.');
                this._needsSeed = false;
            } catch (err) {
                console.error('❌ Failed to seed database:', err);
            }
        }
    }

    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        });
    }

    async seed(storeName, data) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        data.forEach(item => store.put(item));
        return new Promise((r) => tx.oncomplete = r);
    }

    async count(storeName) {
        const tx = this.db.transaction(storeName, 'readonly');
        const request = tx.objectStore(storeName).count();
        return new Promise((r) => request.onsuccess = () => r(request.result));
    }

    // QUERY METHODS
    async getAll(storeName) {
        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction(storeName, 'readonly');
                const request = tx.objectStore(storeName).getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => resolve([]);
            } catch (err) {
                console.error(`getAll failure for ${storeName}:`, err);
                resolve([]);
            }
        });
    }

    async get(storeName, id) {
        const tx = this.db.transaction(storeName, 'readonly');
        const request = tx.objectStore(storeName).get(id);
        return new Promise((r) => request.onsuccess = () => r(request.result));
    }

    async queryRelationships(eov) {
        // Enriches EOV with full names from other stores
        const getNm = async (store, code) => {
            if (!code || (Array.isArray(code) && code.length === 0)) return null;
            let codes = Array.isArray(code) ? code : (code.match(/(DOM-\d+|AS-\d+|SUB-\d+|SE-ITS-\d+|F-\d+|CC-\d+)/g) || []);
            if (codes.length === 0) return code;
            const results = await Promise.all(codes.map(async c => {
                const item = await this.get(store, c);
                // Handle different name field locations based on store
                let name = item?.name || item?.cod || c;
                if (store === 'sub' && item) name = `${item.sigla} - ${item.name}`;
                return { id: c, name: name };
            }));
            return results;
        };

        return {
            ...eov,
            _dominio: await getNm('dom', eov.dominio),
            _area: await getNm('as', eov.area),
            _se: await getNm('se', eov.se),
            _sub: await getNm('sub', eov.sub),
            _fn: await getNm('fn', eov.fn),
            _cc: await getNm('cc', eov.cc)
        };
    }
}

const itsDb = new ITSDatabase();
