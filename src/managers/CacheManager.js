class CacheManager extends Map {
	/**
	 * Identical to [Map.get()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get).
	 * Gets an element with the specified key, and returns its value, or `undefined` if the element does not exist.
	 * @param {*} key - The key to get from this collection
	 * @returns {* | undefined}
	 */

	get(key) {
		return super.get(key);
	}

	/**
	 * Identical to [Map.set()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set).
	 * Sets a new element in the collection with the specified key and value.
	 * @param {*} key - The key of the element to add
	 * @param {*} value - The value of the element to add
	 * @returns {this}
	 */
	set(key, value) {
		return super.set(key, value);
	}

	/**
	 * Identical to [Map.has()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has).
	 * Checks if an element exists in the collection.
	 * @param {*} key - The key of the element to check for
	 * @returns {boolean} `true` if the element exists, `false` if it does not exist.
	 */
	has(key) {
		return super.has(key);
	}

	/**
	 * Identical to [Map.delete()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete).
	 * Deletes an element from the collection.
	 * @param {*} key - The key to delete from the collection
	 * @returns {boolean} `true` if the element was removed, `false` if the element does not exist.
	 */
	delete(key) {
		return super.delete(key);
	}

	/**
	 * Identical to [Map.clear()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear).
	 * Removes all elements from the collection.
	 * @returns {null}
	 */
	clear() {
		return super.clear();
	}

	/**
	 * Searches for a single item where the given function returns a truthy value. This behaves like
	 * [Array.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find).
	 * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get) for details.</warn>
	 * @param {Function} fn The function to test with (should return boolean)
	 * @param {*} [thisArg] Value to use as `this` when executing function
	 * @returns {*}
	 * @example cache.find(user => user.username === 'Bob');
	 */
	find(fn, thisArg = undefined) {
		if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
		for (const [key, val] of this) {
			if (fn(val, key, this)) return val;
		}
		return undefined;
	}

	toJSON() {
		return [...this.values()];
	}
}

module.exports = CacheManager;