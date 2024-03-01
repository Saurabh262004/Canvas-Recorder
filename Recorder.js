class Recorder {
	constructor(canvasID) {
		this.canvas = document.getElementById(canvasID);
		if (!this.canvas) {
			throw new Error('Recorder : invalid element ID');
		}
		this.savedFrames = {
			length : 0
		}
		this.lastRecordingStart;
		this.lastRecordingEnd;
	}

	#invalidArgument = (parameter, expected, receivedParameter, additionalInformation, warn) => {
		let log = `Recorder : invalid value for parameter : ${parameter}\nExpected : ${expected}, received : ${typeof receivedParameter}\n${(additionalInformation) ? additionalInformation : 'No additional information found.'}`;
		if (!warn) throw new Error(log);
		console.warn(log);
	}

	record = (drawFucntion, totalFrames, downloadWhenFinished, customRecordingID, callback) => {
		if (typeof drawFucntion !== 'function') {
			this.#invalidArgument('drawFunction', 'function', drawFucntion);
		}
		if (typeof totalFrames !== 'number') {
			this.#invalidArgument('totalFrames', 'number', totalFrames);
		}
		if (typeof downloadWhenFinished !== 'boolean') {
			this.#invalidArgument('downloadWhenFinished', 'boolean', downloadWhenFinished, 'Setting this parameter to false by default.', true);
			downloadWhenFinished = false;
		}		

		let newRecordingID;

		if (!customRecordingID) {
			let nID = 'recording_'+this.savedFrames.length;
			newRecordingID = (this.savedFrames[nID]) ? Math.round(Math.random()*46655).toString(36) : nID;
		} else if (this.savedFrames[customRecordingID]) {
			throw new Error(`Recorder : The recording with id : ${customRecordingID} is already created`);
		} else {
			newRecordingID = customRecordingID;
		}

		console.log('Recorder : recording...');

		this.lastRecordingStart = performance.now();

		this.savedFrames[newRecordingID] = [];
		this.savedFrames.length++;
		this.#seq(drawFucntion, newRecordingID, totalFrames, downloadWhenFinished, callback);
	}

	#seq = (draw, recordingID, totalFrames, downloadWhenFinished, callback) => {
		if (this.savedFrames[recordingID].length >= totalFrames) {
			this.lastRecordingEnd = performance.now();

			let timeMS = Math.round(this.lastRecordingEnd-this.lastRecordingStart);

			console.log('Recorder : recording completed');
			console.log(`Recorder : recorded total of ${totalFrames} frames in ${timeMS}ms (${timeMS/1000}s)`);

			if (downloadWhenFinished) this.downloadRecording(recordingID);
			if (typeof callback === 'function') callback();

			return;
		}

		draw();
		this.savedFrames[recordingID].push(this.canvas.toDataURL());
		requestAnimationFrame(() => this.#seq(draw, recordingID, totalFrames, downloadWhenFinished, callback));
	}

	downloadRecording = (recordingID) => {
		if (!this.savedFrames[recordingID]) {
			throw new Error(`Recorder : No recording with id [${recordingID}] was found`);
		} else if (this.savedFrames[recordingID].length === 0) {
			throw new Error(`Recorder : The recording [${recordingID}] was created but doesn't contain any frames (it is possible that the recording was deleted)`);
		}

		let zip = new JSZip(),
		fileName = `recorded_frames_[${this.canvas.id}]_[${recordingID}].zip`;

		console.log('Recorder : adding saved frames to a zip file...');

		this.savedFrames[recordingID].forEach((frame, index) => {
			const imgData = frame.split(',')[1];
			const byteCharacters = atob(imgData);
			const byteNumbers = new Array(byteCharacters.length);

			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}

			const imgBlob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/png' });
			zip.file(`${index + 1}.png`, imgBlob);
		});

		zip.generateAsync({ type: 'base64' }).then((content) => {
			let link = document.createElement('a');
			link.href = 'data:application/zip;base64,' + content;
			link.download = fileName;
			link.click();
			console.log(`Recorder : downloading the zip file : ${fileName}...`);
		});
	}

	deleteRecording = (recordingID) => {
		if (!this.savedFrames[recordingID]) {
			throw new Error(`Recorder : No recording with id [${recordingID}] was found`);
		} else if (this.savedFrames[recordingID].length === 0) {
			throw new Error(`Recorder : The recording [${recordingID}] was created but doesn't contain any frames (it is possible that the recording was already deleted)`);
		}
		this.savedFrames[recordingID] = [];
		console.log(`Recorder : deleted the recording [${recordingID}]`);
	}
}
