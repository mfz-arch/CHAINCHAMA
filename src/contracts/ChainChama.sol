// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChainChama {
    struct MemberData {
        string name;
        string phone;
        bool isApproved;
        bool hasContributed;
    }

    struct Group {
        string name;
        address admin;
        uint totalFunds;
        uint minMembers;
        uint maxMembers;
        uint contributionAmount;
        uint cycle; // cycle in minutes for demo
        bool isActive;
        uint memberCount;
        uint payoutIndex; // Tracks whose turn it is to receive funds
    }

    mapping(string => Group) public groups;
    
    // groupCode => array of approved member addresses (for round robin payouts)
    mapping(string => address[]) public groupMembersList;

    // groupCode => memberAddress => MemberData
    mapping(string => mapping(address => MemberData)) public members;
    
    // groupCode => memberAddress => bool
    mapping(string => mapping(address => bool)) public pendingRequests;

    function createGroup(
        string memory _code, 
        string memory _name, 
        string memory _chairmanName,
        string memory _chairmanPhone,
        uint _minMembers, 
        uint _maxMembers,
        uint _contributionAmount,
        uint _cycle
    ) public {
        require(groups[_code].admin == address(0), "Group code already exists");
        require(_maxMembers >= _minMembers, "Max members must be >= min members");
        
        groups[_code] = Group({
            name: _name,
            admin: msg.sender,
            totalFunds: 0,
            minMembers: _minMembers,
            maxMembers: _maxMembers,
            contributionAmount: _contributionAmount,
            cycle: _cycle,
            isActive: false,
            memberCount: 1,
            payoutIndex: 0
        });

        // Admin is automatically approved and added, but hasn't contributed yet
        members[_code][msg.sender] = MemberData({
            name: _chairmanName,
            phone: _chairmanPhone,
            isApproved: true,
            hasContributed: false
        });
        
        // Add admin to the round robin list
        groupMembersList[_code].push(msg.sender);
    }

    function requestJoin(string memory _code, string memory _name, string memory _phone) public {
        require(groups[_code].admin != address(0), "Group does not exist");
        require(!members[_code][msg.sender].isApproved, "Already a member");
        require(groups[_code].memberCount < groups[_code].maxMembers, "Group is full");
        
        pendingRequests[_code][msg.sender] = true;
        members[_code][msg.sender] = MemberData({
            name: _name,
            phone: _phone,
            isApproved: false,
            hasContributed: false
        });
    }

    function approveMember(string memory _code, address _member) public {
        require(msg.sender == groups[_code].admin, "Only Chairman can approve");
        require(pendingRequests[_code][_member], "No pending request");
        require(groups[_code].memberCount < groups[_code].maxMembers, "Group is full");
        
        pendingRequests[_code][_member] = false;
        members[_code][_member].isApproved = true;
        groups[_code].memberCount++;
        
        groupMembersList[_code].push(_member); // Add to payout list
        
        if(groups[_code].memberCount >= groups[_code].minMembers) {
            groups[_code].isActive = true;
        }
    }

    function contribute(string memory _code) public payable {
        require(members[_code][msg.sender].isApproved, "Not an approved member");
        require(!members[_code][msg.sender].hasContributed, "Already contributed");
        require(msg.value == groups[_code].contributionAmount, "Incorrect contribution amount");
        
        members[_code][msg.sender].hasContributed = true;
        groups[_code].totalFunds += msg.value;
    }

    // New Payout function for the Hackathon Demo
    function startCycle(string memory _code) public {
        require(msg.sender == groups[_code].admin, "Only Chairman can start cycle");
        require(groups[_code].totalFunds > 0, "No funds to payout");

        // Identify the next recipient
        address payable recipient = payable(groupMembersList[_code][groups[_code].payoutIndex]);
        uint payoutAmount = groups[_code].totalFunds;
        
        // Zero out the funds
        groups[_code].totalFunds = 0;
        
        // Increment the payout index (wrap around back to 0 if at the end)
        groups[_code].payoutIndex = (groups[_code].payoutIndex + 1) % groupMembersList[_code].length;
        
        // Reset everyone's contribution status for the next cycle
        for(uint i = 0; i < groupMembersList[_code].length; i++) {
            members[_code][groupMembersList[_code][i]].hasContributed = false;
        }

        // Transfer the funds to the recipient
        recipient.transfer(payoutAmount);
    }
}

