// src/services/mockTrackingService.js
// Mock tracking service for simulating real-time device movement

class MockTrackingService {
  constructor() {
    this.activeTrackers = new Map(); // 存储活跃的追踪器
  }

  /**
   * 开始模拟追踪
   * @param {string} orderId - 订单ID
   * @param {Object} route - 路线信息 {origin, pickup, delivery}
   * @param {Object} initialDeviceLocation - 设备初始位置
   * @param {function} onLocationUpdate - 位置更新回调
   * @param {function} onStatusUpdate - 状态更新回调 (可选)
   * @returns {string} trackerId - 追踪器ID，用于停止追踪
   */
  startTracking(
    orderId,
    route,
    initialDeviceLocation,
    onLocationUpdate,
    onStatusUpdate = null
  ) {
    // 如果已经在追踪这个订单，先停止
    if (this.activeTrackers.has(orderId)) {
      this.stopTracking(orderId);
    }

    // 计算完整路径
    const fullPath = this.calculateFullPath(route);

    // 创建追踪器配置
    const tracker = {
      orderId,
      route,
      fullPath,
      currentSegmentIndex: 0, // 当前路段索引 (0: 站点→取货, 1: 取货→送货)
      segmentProgress: 0, // 当前路段进度 (0-1)
      currentPosition: initialDeviceLocation || fullPath[0],
      onLocationUpdate,
      onStatusUpdate,
      startTime: Date.now(),
      totalSegments: fullPath.length - 1,
      speed: 0.02, // 每次更新的进度步长 (2%)
      interval: null,
    };

    // 启动定时器
    tracker.interval = setInterval(() => {
      this.updateTrackerPosition(tracker);
    }, 1000); // 每秒更新一次

    // 存储追踪器
    this.activeTrackers.set(orderId, tracker);

    console.log(`MockTrackingService: Started tracking for order ${orderId}`);

    // 立即发送初始位置
    onLocationUpdate(tracker.currentPosition);

    return orderId;
  }

  /**
   * 停止指定订单的追踪
   * @param {string} orderId - 订单ID
   */
  stopTracking(orderId) {
    const tracker = this.activeTrackers.get(orderId);
    if (tracker && tracker.interval) {
      clearInterval(tracker.interval);
      this.activeTrackers.delete(orderId);
      console.log(`MockTrackingService: Stopped tracking for order ${orderId}`);
    }
  }

  /**
   * 停止所有追踪
   */
  stopAllTracking() {
    for (const [orderId] of this.activeTrackers) {
      this.stopTracking(orderId);
    }
  }

  /**
   * 计算完整路径点
   * @param {Object} route - {origin, pickup, delivery}
   * @returns {Array} 路径点数组
   */
  calculateFullPath(route) {
    const path = [];

    // 站点位置
    if (route.origin && route.origin.latitude && route.origin.longitude) {
      path.push({
        latitude: route.origin.latitude,
        longitude: route.origin.longitude,
        name: route.origin.name || "Station",
      });
    }

    // 取货位置
    if (route.pickup && route.pickup.latitude && route.pickup.longitude) {
      path.push({
        latitude: route.pickup.latitude,
        longitude: route.pickup.longitude,
        name: "Pickup Location",
      });
    }

    // 送货位置
    if (route.delivery && route.delivery.latitude && route.delivery.longitude) {
      path.push({
        latitude: route.delivery.latitude,
        longitude: route.delivery.longitude,
        name: "Delivery Location",
      });
    }

    // 如果路径点不足，使用默认的旧金山坐标
    if (path.length < 2) {
      console.warn(
        "MockTrackingService: Insufficient route data, using default path"
      );
      return [
        { latitude: 37.7849, longitude: -122.4094, name: "Station" },
        { latitude: 37.7751, longitude: -122.4193, name: "Pickup" },
        { latitude: 37.7749, longitude: -122.4194, name: "Delivery" },
      ];
    }

    return path;
  }

  /**
   * 更新追踪器位置
   * @param {Object} tracker - 追踪器对象
   */
  updateTrackerPosition(tracker) {
    const { fullPath, currentSegmentIndex, segmentProgress, speed } = tracker;

    // 检查是否已完成所有路段
    if (currentSegmentIndex >= fullPath.length - 1) {
      // 到达最终目的地
      tracker.currentPosition = {
        ...fullPath[fullPath.length - 1],
        speed: 0,
        heading: 0,
        timestamp: new Date().toISOString(),
      };

      tracker.onLocationUpdate(tracker.currentPosition);

      // 触发最终状态更新
      if (tracker.onStatusUpdate) {
        setTimeout(() => {
          tracker.onStatusUpdate("DELIVERED");
        }, 2000);
      }

      // 停止追踪
      this.stopTracking(tracker.orderId);
      return;
    }

    // 计算当前路段的起点和终点
    const startPoint = fullPath[currentSegmentIndex];
    const endPoint = fullPath[currentSegmentIndex + 1];

    // 计算新的进度
    let newProgress = segmentProgress + speed;

    // 检查是否完成当前路段
    if (newProgress >= 1.0) {
      // 移动到下一个路段
      tracker.currentSegmentIndex++;
      tracker.segmentProgress = 0;
      newProgress = 0;

      // 触发状态更新
      if (tracker.onStatusUpdate && currentSegmentIndex === 0) {
        // 刚到达取货点
        tracker.onStatusUpdate("PICKED_UP");
        setTimeout(() => {
          tracker.onStatusUpdate("DELIVERING");
        }, 1000);
      }
    } else {
      tracker.segmentProgress = newProgress;
    }

    // 使用线性插值计算当前位置
    const currentPos = this.interpolatePosition(
      startPoint,
      endPoint,
      newProgress
    );

    // 添加额外的tracking信息
    const trackingInfo = {
      ...currentPos,
      speed: this.calculateSpeed(startPoint, endPoint, speed),
      heading: this.calculateHeading(startPoint, endPoint),
      altitude: 50, // 模拟高度
      timestamp: new Date().toISOString(),
      segmentIndex: currentSegmentIndex,
      progress: newProgress,
      nextWaypoint: endPoint.name,
    };

    tracker.currentPosition = trackingInfo;
    tracker.onLocationUpdate(trackingInfo);
  }

  /**
   * 线性插值计算位置
   * @param {Object} start - 起点 {latitude, longitude}
   * @param {Object} end - 终点 {latitude, longitude}
   * @param {number} progress - 进度 (0-1)
   * @returns {Object} 插值后的位置
   */
  interpolatePosition(start, end, progress) {
    // 添加少量随机偏移模拟真实GPS漂移
    const noise = 0.0001; // 约10米的偏移
    const randomOffsetLat = (Math.random() - 0.5) * noise;
    const randomOffsetLng = (Math.random() - 0.5) * noise;

    return {
      latitude:
        start.latitude +
        (end.latitude - start.latitude) * progress +
        randomOffsetLat,
      longitude:
        start.longitude +
        (end.longitude - start.longitude) * progress +
        randomOffsetLng,
    };
  }

  /**
   * 计算移动速度 (km/h)
   * @param {Object} start - 起点
   * @param {Object} end - 终点
   * @param {number} progressSpeed - 进度速度
   * @returns {number} 速度
   */
  calculateSpeed(start, end, progressSpeed) {
    // 简化计算：假设每个路段大约2km，每秒移动2%，计算出大概的速度
    const estimatedDistance = 2; // km
    const timeToComplete = 1 / progressSpeed; // 秒
    const speedKmh = (estimatedDistance * 3600) / timeToComplete;
    return Math.round(speedKmh * 0.8); // 添加一些变化
  }

  /**
   * 计算移动方向 (度数)
   * @param {Object} start - 起点
   * @param {Object} end - 终点
   * @returns {number} 方向角度 (0-360)
   */
  calculateHeading(start, end) {
    const deltaLat = end.latitude - start.latitude;
    const deltaLng = end.longitude - start.longitude;

    let heading = (Math.atan2(deltaLng, deltaLat) * 180) / Math.PI;
    heading = (heading + 360) % 360; // 确保0-360范围

    return Math.round(heading);
  }

  /**
   * 获取当前活跃的追踪器数量
   * @returns {number}
   */
  getActiveTrackersCount() {
    return this.activeTrackers.size;
  }

  /**
   * 检查指定订单是否正在被追踪
   * @param {string} orderId - 订单ID
   * @returns {boolean}
   */
  isTracking(orderId) {
    return this.activeTrackers.has(orderId);
  }
}

// 创建单例实例
const mockTrackingService = new MockTrackingService();

// 页面卸载时清理所有追踪器
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    mockTrackingService.stopAllTracking();
  });
}

export default mockTrackingService;
export { MockTrackingService };
