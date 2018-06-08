export function getReadableMeasure(measure) {
    switch (measure) {
        case "hits":
            return "Hits / Min"
        case "errors":
            return "Errors / Min"
        case "duration":
            return "Latency"
        case "duration.by_service":
            return "Latency by Service"
        case "duration.by_type":
            return "Latency by Type"
        default:
            return "Unknown Measure"
    }
}