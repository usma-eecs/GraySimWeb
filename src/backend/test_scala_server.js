const policyDescriptions = {
    FIFO: 'First In, First Out: When the currently running process ceases to execute, the process that has been in the READY state the longest is selected to execute next.',
    SJF: 'Shortest Job First: When the currently running process ceases to execute, the process that has the SHORTEST expected processing time is selected next. SJF is a non-preemptive scheduling algorithm.',
    STCF: 'Shortest Time-to-Completion First: When the currently running process ceases to execute, the process that has the SHORTEST remaining processing time is selected next. STCF is a preemptive scheduling algorithm.',
    RR: 'Round Robin: When the currently running process ceases to execute or the timer expires, the process is moved back to the ready queue and the process that has been in the READY state the longest is selected to execute next for a time quanta.',
    MLFQ: 'Multi-Level Feedback Queue: When the currently running process ceases to execute, it is placed on the next lowest priority queue (if it has not completed its processing). The OS allocates the processor to the first process on the highest priority queue. The quantum is 2^i, where i is the priority of the queue on which the process had been waiting. MLFQ is a preemptive scheduling process.'
};

const get_policy = (policyName) => {
    return policyDescriptions[policyName] || 'Unknown policy. Please try FIFO, SJF, STCF, RR, or MLFQ.';
};

