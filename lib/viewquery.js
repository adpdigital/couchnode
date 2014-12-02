'use strict';

var util = require('util');

/**
 * Class for dynamically construction of view queries.  This class should
 * never be constructed directly, instead you should use
 * {@link ViewQuery.from} to construct this object.
 *
 * @constructor
 *
 * @since 2.0.1
 * @committed
 *
 * @private
 */
function ViewQuery() {
  this.ddoc = null;
  this.name = null;
  this.options = {};
}

/**
 * Enumeration for specifying view update semantics.
 *
 * @readonly
 * @enum {number}
 */
ViewQuery.Update = {
  /**
   * Causes the view to be fully indexed before results are retrieved.
   */
  BEFORE: 1,

  /**
   * Allows the index to stay in whatever state it is already in prior
   * retrieval of the query results.
   */
  NONE: 2,

  /**
   * Forces the view to be indexed after the results of this query has
   * been fetched.
   */
  AFTER: 3
};

/**
 * Enumeration for specifying view result ordering.
 *
 * @readonly
 * @enum {number}
 */
ViewQuery.Order = {
  /**
   * Orders with lower values first and higher values last.
   */
  ASCENDING: 1,

  /**
   * Orders with higher values first and lower values last.
   */
  DESCENDING: 2
};

/**
 * Specifies the design document and view name to use for this query.
 *
 * @param {string} ddoc The design document to use.
 * @param {string} name The view to use.
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.from = function(ddoc, name) {
  this.ddoc = ddoc;
  this.name = name;
  return this;
};

/**
 * Specifies how this query will affect view indexing, both before and
 * after the query is executed.
 *
 * @param {ViewQuery.Update} stale How to update the index.
 * @default ViewQuery.Update.NONE
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.stale = function(stale) {
  if (stale === ViewQuery.Update.BEFORE) {
    this.options.stale = 'false';
  } else if (stale === ViewQuery.Update.NONE) {
    this.options.stale = 'ok';
  } else if (stale === ViewQuery.Update.AFTER) {
    this.options.stale = 'update_after';
  } else {
    throw new TypeError('invalid option passed.');
  }
  return this;
};

/**
 * Specifies how many results to skip from the beginning of the result set.
 *
 * @param {number} skip
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.skip = function(skip) {
  this.options.skip = skip;
  return this;
};

/**
 * Specifies the maximum number of results to return.
 *
 * @param {number} limit
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.limit = function(limit) {
  this.options.limit = limit;
  return this;
};

/**
 * Allows you to specify custom view options that may not be available
 * though the fluent interface defined by this class.
 *
 * @param {Object} opts
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.custom = function(opts) {
  for (var i in opts) {
    /* istanbul ignore else */
    if (opts.hasOwnProperty(i)) {
      this.options[i] = opts[i];
    }
  }
  return this;
};

/**
 * Specifies the desired ordering for the results.
 *
 * @param {ViewQuery.Order} order
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.order = function(order) {
  if (order === ViewQuery.Order.ASCENDING) {
    this.options.descending = false;
  } else if (order === ViewQuery.Order.DESCENDING) {
    this.options.descending = true;
  } else {
    throw new TypeError('invalid option passed.');
  }
  return this;
};

/**
 * Specifies whether to execute the map-reduce reduce step.
 *
 * @param {boolean} reduce
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.reduce = function(reduce) {
  this.options.reduce = reduce;
  return this;
};

/**
 * Specifies at what level to perform result grouping.  These levels map to
 * indexes within the emitted key arrays.  A value of -1 indicates to not
 * perform any grouping.
 *
 * @param {number} group_level
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.group = function(group_level) {
  if (group_level >= 0) {
    this.options.group = false;
    this.options.group_level = group_level;
  } else {
    this.options.group = true;
    this.options.group_level = 0;
  }
  return this;
};

/**
 * Specifies a specified key to retrieve from the index.
 *
 * @param {string} key
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.key = function(key) {
  this.options.key = JSON.stringify(key);
  return this;
};

/**
 * Specifies a list of keys you wish to retrieve from the index.
 *
 * @param {Array.<string>} keys
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.keys = function(keys) {
  this.options.keys = JSON.stringify(keys);
  return this;
};

/**
 * Specifies a range of keys to retrieve from the index.  You may specify both
 * a start and an end point and additionally specify whether or not the end
 * value is inclusive or exclusive.
 *
 * @param {string|undefined} start
 * @param {string|undefined} end
 * @param {boolean} [inclusive_end]
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.range = function(start, end, inclusive_end) {
  this.options.startkey = JSON.stringify(start);
  this.options.endkey = JSON.stringify(end);
  if (inclusive_end) {
    this.options.inclusive_end = 'true';
  } else {
    delete this.options.inclusive_end;
  }
  return this;
};

/**
 * Specifies a range of document id's to retrieve from the index.
 *
 * @param {string|undefined} start
 * @param {string|undefined} end
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.prototype.id_range = function(start, end) {
  this.options.startkey_docid = start;
  this.options.endkey_docid = end;
  return this;
};

/**
 * Instantiates a {@link ViewQuery} object for the specified design
 * document and view name.
 *
 * @param {string} ddoc The design document to use.
 * @param {string} name The view to use.
 * @returns {ViewQuery}
 *
 * @since 2.0.0
 * @committed
 */
ViewQuery.from = function(ddoc, name) {
  return (new ViewQuery()).from(ddoc, name);
};

// For backwards compatibility with 2.0.0
var SpatialQuery = require('./spatialquery');
ViewQuery.fromSpatial = SpatialQuery.from;
ViewQuery.Default = ViewQuery;
ViewQuery.Spatial = SpatialQuery;

module.exports = ViewQuery;