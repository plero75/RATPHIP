/* Helpers ----------------------------------------------------------*/
function diffMin(isoStr){
  return Math.max(0,
    Math.ceil((new Date(isoStr)-Date.now())/60_000));
}

/* StopMonitoring → liste de départs normalisés ---------------------*/
export function parseStop(json){
  const visits = json?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit || [];
  return visits.map(v=>{
    const mvj  = v.MonitoredVehicleJourney;
    const call = mvj.MonitoredCall;
    return {
      journeyId: mvj.FramedVehicleJourneyRef?.DatedVehicleJourneyRef,
      mode:      mvj.VehicleMode || mvj.TransportSubmode || "unknown",
      line:      mvj.PublishedLineName || mvj.LineRef,
      dest:      Array.isArray(call.DestinationDisplay)
                 ? call.DestinationDisplay[0].value : call.DestinationDisplay,
      minutes:   diffMin(call.ExpectedDepartureTime),
      expTime:   call.ExpectedDepartureTime,
      status:    call.DepartureStatus || "onTime"
    };
  });
}

/* VehicleJourney → liste des arrêts restants ----------------------*/
export function parseJourney(json){
  return json?.Siri?.ServiceDelivery?.VehicleMonitoringDelivery?.[0]
           ?.VehicleActivity?.[0]?.MonitoredVehicleJourney?.OnwardCalls
           ?.OnwardCall?.map(c=>c.StopPointName) || [];
}
