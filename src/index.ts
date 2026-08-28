import { EventEmitter } from 'node:events';

import addon from './addon.js';

class ElectronShutdownHandlerClass extends EventEmitter {
	private static readonly SHUTDOWN_EVENT = 'shutdown';

	constructor() {
		super();

		this.on('newListener', (event: string) => {
			if (
				event == ElectronShutdownHandlerClass.SHUTDOWN_EVENT &&
				this.listenerCount(
					ElectronShutdownHandlerClass.SHUTDOWN_EVENT
				) == 0
			) {
				// create native listener
				if (addon) {
					addon.insertWndProcHook(() => {
						this.emit(ElectronShutdownHandlerClass.SHUTDOWN_EVENT);
					});
				}
			}
		});

		this.on('removeListener', (event: string) => {
			if (
				event == ElectronShutdownHandlerClass.SHUTDOWN_EVENT &&
				this.listenerCount(
					ElectronShutdownHandlerClass.SHUTDOWN_EVENT
				) == 0
			) {
				// remove native listener
				if (addon) {
					addon.removeWndProcHook();
				}
			}
		});
	}

	setWindowHandle(handle: Buffer): void {
		if (!addon) {
			return;
		}

		addon.setMainWindowHandle(handle);
	}

	blockShutdown(reason: string): boolean {
		if (!addon) {
			return false;
		}

		return addon.acquireShutdownBlock(reason);
	}

	releaseShutdown(): boolean {
		if (!addon) {
			return false;
		}

		return addon.releaseShutdownBlock();
	}
}

const ElectronShutdownHandler = new ElectronShutdownHandlerClass();

export default ElectronShutdownHandler;
